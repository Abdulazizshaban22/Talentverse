import express from 'express'
import http from 'http'
import { Server as IOServer } from 'socket.io'
import { PrismaClient } from '@prisma/client'
import fetch from 'node-fetch'
import Stripe from 'stripe'
import client from 'prom-client'
import * as jose from 'jose'

const prisma = new PrismaClient()
const app = express()
const server = http.createServer(app)
const io = new IOServer(server, { cors: { origin: '*' } })

const port = Number(process.env.PORT_API||4000)
const issuer = process.env.KEYCLOAK_ISSUER||''
const jwksUrl = process.env.KEYCLOAK_JWKS_URL||''
const audience = process.env.KEYCLOAK_AUDIENCE||'web'

// Body parsers
app.use(express.json())
app.use(require('express-prom-bundle')({ includeMethod: true, includePath: true }))

// ---- Prometheus custom metrics ----
const register = new client.Registry()
client.collectDefaultMetrics({ register })
const msgCounter = new client.Counter({ name:'tf_messages_total', help:'Messages sent', registers:[register] })
const authFailures = new client.Counter({ name:'tf_acl_auth_fail_total', help:'ACL auth failures', registers:[register] })
app.get('/metrics', async (_req,res)=>{
  res.setHeader('Content-Type', register.contentType)
  res.end(await register.metrics())
})

// ---- JWT verifier (Keycloak) ----
const jwks = jose.createRemoteJWKSet(new URL(jwksUrl))
async function verifyToken(bearer?: string){
  if(!bearer) throw new Error('no_token')
  const token = bearer.replace(/^Bearer\s+/i,'')
  const { payload } = await jose.jwtVerify(token, jwks, { issuer, audience })
  return payload as any
}
function extractRoles(payload:any){
  const realm = (payload?.realm_access?.roles)||[]
  const client = (payload?.resource_access?.[audience]?.roles)||[]
  return [...new Set([...(realm||[]), ...(client||[])])].map(String)
}

// ---- Channels ACL config ----
const CHANNEL_ACL: Record<string,string[]> = {
  'general': ['talent','recruiter','admin'],
  'admin':   ['admin'],
  'jobs':    ['talent','recruiter','admin'],
  'support': ['talent','recruiter','admin','moderator']
}
function isAllowed(channel: string, roles: string[]){
  const allowed = CHANNEL_ACL[channel] || ['talent','recruiter','admin']
  return roles.some(r => allowed.includes(String(r).toLowerCase()))
}

// ---- Socket.IO with ACL ----
io.use(async (socket, next)=>{
  try{
    const token = (socket.handshake.auth?.token || socket.handshake.headers?.authorization) as string
    const payload = await verifyToken(token)
    // @ts-ignore
    socket.data.user = { sub: payload.sub, roles: extractRoles(payload) }
    return next()
  }catch(e){
    authFailures.inc()
    return next(new Error('unauthorized'))
  }
})

type Presence = { users: Map<string, number> }
const channels: Map<string, Presence> = new Map()

io.on('connection', (socket)=>{
  socket.on('join', ({ channel })=>{
    const user = (socket as any).data?.user
    if(!user || !isAllowed(channel, user.roles)) return
    socket.join(channel)
    const p = channels.get(channel) || { users: new Map() }
    p.users.set(user.sub, Date.now())
    channels.set(channel, p)
    io.to(channel).emit('presence', { count: p.users.size })
  })
  socket.on('typing', ({ channel })=>{
    const user = (socket as any).data?.user
    if(!user || !isAllowed(channel, user.roles)) return
    io.to(channel).emit('typing', { users: [user.sub] })
  })
})

// REST fallbacks for presence/messages with ACL
app.post('/realtime/typing', async (req,res)=>{
  try{
    const payload = await verifyToken(req.headers.authorization as string)
    const roles = extractRoles(payload)
    const { channel } = req.body||{}
    if(!isAllowed(channel, roles)) return res.status(403).json({ ok:false, error:'forbidden' })
    io.to(channel).emit('typing', { users: [payload.sub] })
    res.json({ ok:true })
  }catch(_){ authFailures.inc(); res.status(401).json({ ok:false }) }
})

app.post('/realtime/send', async (req,res)=>{
  try{
    const payload = await verifyToken(req.headers.authorization as string)
    const roles = extractRoles(payload)
    const { channel, text } = req.body||{}
    if(!isAllowed(channel, roles)) return res.status(403).json({ ok:false, error:'forbidden' })
    msgCounter.inc()
    io.to(channel).emit('message', { userId: payload.sub, text })
    await prisma.auditLog.create({ data:{ actorId: String(payload.sub||''), action:'realtime.send', data:{ channel } } })
    res.json({ ok:true })
  }catch(_){ authFailures.inc(); res.status(401).json({ ok:false }) }
})

// ---- Ranker: Graph + LTR Fusion (learnable weights) ----
function scoreGraph(job:any, pSkills:Set<string>){
  const j = (job.skills||[]).map((js:any)=> js.skill.name.toLowerCase())
  const overlap = j.filter((s:string)=> pSkills.has(s)).length
  const norm = Math.max(j.length, 1)
  const recency = Math.max(1, (Date.now()-new Date(job.createdAt).getTime())/86400000)
  return (overlap/norm) * (1/recency)
}

async function pageRankFeature(jobId: string): Promise<number>{
  // Placeholder: wire Neo4j GDS result here if available
  return 0
}

app.post('/ranker/set-weights', async (req,res)=>{
  const { wGraph, wLTR } = req.body||{}
  const r = await prisma.rankerWeights.upsert({ where:{ id:'singleton' }, update:{ wGraph, wLTR }, create:{ id:'singleton', wGraph, wLTR } })
  await prisma.auditLog.create({ data:{ actorId:'admin', action:'ranker.set', data:{ wGraph, wLTR } } })
  res.json({ ok:true, r })
})

app.get('/recs/fusion', async (req,res)=>{
  const userId = String(req.query.userId||'')
  const weights = await prisma.rankerWeights.findUnique({ where:{ id:'singleton' } }) || { wGraph:Number(process.env.COMBINE_W_GRAPH||0.5), wLTR:Number(process.env.COMBINE_W_LTR||0.5) }
  const profile = await prisma.profile.findFirst({ where:{ userId }, include:{ skills:{ include:{ skill:true } } } })
  if(!profile) return res.json([])
  const jobs = await prisma.job.findMany({ include:{ skills:{ include:{ skill:true } } }, take: 100, orderBy:{ createdAt:'desc' } })
  const pSkills = new Set(profile.skills.map(ps=> ps.skill.name.toLowerCase()))
  const features:number[][] = []
  const base:any[] = []
  for(const j of jobs){
    const g = scoreGraph(j, pSkills)
    const pr = await pageRankFeature(j.id)
    const jskills = (j.skills||[]).map((s:any)=> s.skill.name.toLowerCase())
    const ratio = jskills.filter((s:string)=> pSkills.has(s)).length / Math.max(jskills.length,1)
    const recInv = 1/Math.max(1,(Date.now()-new Date(j.createdAt).getTime())/86400000)
    features.push([ratio, recInv, pr])
    base.push({ job:j, g })
  }
  // LTR
  let ltrScores:number[] = Array(jobs.length).fill(0)
  try{
    const aiUrl = (process.env.AI_MATCH_URL||'http://localhost:8600').replace(/\/$/,'')
    const r = await fetch(aiUrl+'/predict', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ features }) })
    const dj = await r.json()
    if(dj && dj.ok && Array.isArray(dj.scores)) ltrScores = dj.scores.map((x:any)=> Number(x)||0)
    else ltrScores = features.map(f=> f[0])
  }catch(_){ ltrScores = features.map(f=> f[0]) }

  const ranked = base.map((b, i)=>{
    const combined = Number(weights.wGraph)*b.g + Number(weights.wLTR)*ltrScores[i]
    return { id: b.job.id, title:b.job.title, company:b.job.company, score: combined }
  }).sort((a,b)=> b.score - a.score).slice(0, 20)

  res.json(ranked)
})

// ---- Payments: Stripe webhook (verify) ----
app.post('/payments/stripe/webhook', express.raw({ type: '*/*' }), (req, res)=>{
  const sig = req.headers['stripe-signature'] as string||''
  const secret = process.env.STRIPE_SIGNING_SECRET||''
  const stripe = new Stripe('sk_test_xxx', { apiVersion: '2024-06-20' })
  try{
    const event = stripe.webhooks.constructEvent(req.body, sig, secret)
    return res.json({ ok:true, type: event.type })
  }catch(e:any){
    return res.status(400).json({ ok:false, error:'invalid_signature', message: e.message })
  }
})

// ---- Payments: HyperPay (redirect flow) ----
app.post('/payments/hyperpay/checkout', async (req,res)=>{
  const { amount='10.00', currency='SAR' } = req.body||{}
  const testMode = String(process.env.HYPERPAY_TEST_MODE||'true')==='true'
  const entityId = process.env.HYPERPAY_ENTITY_ID||''
  const accessToken = process.env.HYPERPAY_ACCESS_TOKEN||''
  const url = testMode ? 'https://eu-test.oppwa.com/v1/checkouts' : 'https://oppwa.com/v1/checkouts'
  const payload = new URLSearchParams({
    entityId, amount, currency,
    paymentType: 'DB',
    'customer.merchantCustomerId': 'user-1',
    'merchantTransactionId': 'tx-'+Date.now()
  })
  const r = await fetch(url, { method:'POST', headers:{ 'Authorization': accessToken, 'Content-Type':'application/x-www-form-urlencoded' }, body: payload.toString() })
  const dj = await r.json().catch(()=>({}))
  res.json(dj)
})

// ---- Payments: Tap (redirect for mada/3DS) ----
app.post('/payments/tap/charge', async (req,res)=>{
  const { amount=10, currency='SAR', customerId='cust_1' } = req.body||{}
  const key = process.env.TAP_SECRET_KEY||''
  const ret = process.env.TAP_RETURN_URL||'http://localhost:3000/payments/tap/return'
  const body = {
    amount,
    currency,
    threeDSecure: true,
    save_card: false,
    customer: { id: customerId },
    source: { id: 'src_all' }, // Tap will present methods incl. mada
    redirect: { url: ret }
  }
  const r = await fetch('https://api.tap.company/v2/charges', { method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization': `Bearer ${key}` }, body: JSON.stringify(body) })
  const dj = await r.json().catch(()=>({}))
  res.json(dj)
})

app.get('/payments/tap/return', async (req,res)=>{
  // Tap will redirect here with tap_id or charge_id
  const id = String(req.query.tap_id||req.query.charge_id||'')
  res.json({ ok:true, id })
})

// ---- Admin: bans/safety/reports/audit ----
app.post('/admin/bans/ban', async (req,res)=>{
  const { userId, minutes=60, reason='policy' } = req.body||{}
  const until = new Date(Date.now() + Math.max(1,Number(minutes))*60000)
  const b = await prisma.ban.create({ data:{ userId, until, reason } })
  await prisma.auditLog.create({ data:{ actorId: 'admin', action:'ban.create', data:{ userId, until, reason } } })
  res.json(b)
})
app.post('/admin/bans/unban', async (req,res)=>{
  const { id } = req.body||{}
  const b = await prisma.ban.delete({ where:{ id } })
  await prisma.auditLog.create({ data:{ actorId: 'admin', action:'ban.delete', data:{ id } } })
  res.json({ ok:true, id: b.id })
})
app.get('/admin/bans/list', async (_req,res)=>{
  const list = await prisma.ban.findMany({ orderBy:{ createdAt:'desc' }, take: 200 })
  res.json(list)
})
app.get('/admin/safety/list', async (_req,res)=>{
  const list = await prisma.safetyFlag.findMany({ orderBy:{ createdAt:'desc' }, take: 200 })
  res.json(list)
})
app.get('/admin/audit/list', async (_req,res)=>{
  const rows = await prisma.auditLog.findMany({ orderBy:{ createdAt:'desc' }, take: 200 })
  res.json(rows)
})

// ---- Health ----
app.get('/health', (_req,res)=> res.json({ ok:true, v:'2.7' }))

server.listen(port, ()=> console.log('API v2.7 listening on', port))
