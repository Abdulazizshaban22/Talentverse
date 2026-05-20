import express from 'express'
import http from 'http'
import { Server as IOServer } from 'socket.io'
import { PrismaClient } from '@prisma/client'
import fetch from 'node-fetch'
import Stripe from 'stripe'
import client from 'prom-client'
import * as jose from 'jose'
import neo4j from 'neo4j-driver'

const prisma = new PrismaClient()
const app = express()
const server = http.createServer(app)
const io = new IOServer(server, { cors: { origin: '*' } })

const port = Number(process.env.PORT_API||4000)
const issuer = process.env.KEYCLOAK_ISSUER||''
const jwksUrl = process.env.KEYCLOAK_JWKS_URL||''
const audience = process.env.KEYCLOAK_AUDIENCE||'web'

// Neo4j driver (optional)
const neo = (process.env.NEO4J_URL ? neo4j.driver(process.env.NEO4J_URL, neo4j.auth.basic(process.env.NEO4J_USERNAME||'', process.env.NEO4J_PASSWORD||'')) : null)
const neoDb = process.env.NEO4J_DATABASE||'neo4j'
const jobLabel = process.env.NEO4J_JOB_LABEL||'Job'
const jobIdKey = process.env.NEO4J_JOB_ID_KEY||'id'
const prProp   = process.env.NEO4J_PAGERANK_PROP||'pagerank'

app.use(express.json({ limit: '2mb' }))
app.use(require('express-prom-bundle')({ includeMethod: true, includePath: true }))

// ---- Prometheus custom metrics ----
const register = new client.Registry()
client.collectDefaultMetrics({ register })
const msgCounter = new client.Counter({ name:'tf_messages_total', help:'Messages sent', registers:[register] })
const authFailures = new client.Counter({ name:'tf_acl_auth_fail_total', help:'ACL auth failures', registers:[register] })
const wsGauge = new client.Gauge({ name:'tf_ws_channel_connections', help:'Connected users per channel', labelNames:['channel'], registers:[register] })
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
  return [...new Set([...(realm||[]), ...(client||[])])].map(String).map(s=>s.toLowerCase())
}
function hasUmaPermission(payload:any, resource:string, scope:string){
  // If Keycloak Authorization Services is issuing RPT with "permissions", check there
  const perms = (payload?.authorization?.permissions)||[]
  return perms.some((p:any)=> String(p.resource_name||p.rsname||'')===resource && (p.scopes||[]).includes(scope))
}

// ---- ACL storage ----
async function getAllowedRoles(channel:string): Promise<string[]>{
  const row = await prisma.channelAcl.findUnique({ where:{ channel } })
  if(row && Array.isArray(row.roles)) return row.roles as any
  // default
  if(channel==='admin') return ['admin']
  if(channel==='support') return ['talent','recruiter','admin','moderator']
  return ['talent','recruiter','admin']
}
function isAllowedByRoles(channel:string, roles:string[]){
  return roles.some(r=> (['talent','recruiter','admin','moderator']).includes(r) && getAllowedRoles(channel))
}

// ---- Socket.IO with ACL ----
type Presence = { users: Map<string, number> }
const channels: Map<string, Presence> = new Map()

io.use(async (socket, next)=>{
  try{
    const token = (socket.handshake.auth?.token || socket.handshake.headers?.authorization) as string
    const payload = await verifyToken(token)
    // @ts-ignore
    socket.data.user = { sub: payload.sub, roles: extractRoles(payload), perms: payload?.authorization?.permissions||[] }
    return next()
  }catch(e){
    authFailures.inc()
    return next(new Error('unauthorized'))
  }
})

io.on('connection', (socket)=>{
  socket.on('join', async ({ channel })=>{
    const user = (socket as any).data?.user
    if(!user) return
    const roles = user.roles||[]
    const allowed = (await getAllowedRoles(channel)).map(String).map(s=>s.toLowerCase())
    const hasRole = roles.some((r:string)=> allowed.includes(r))
    const hasPolicy = hasUmaPermission((socket as any).data?.user, `channel:${channel}`, 'join')
    if(!(hasRole || hasPolicy)) return
    socket.join(channel)
    const p = channels.get(channel) || { users: new Map() }
    p.users.set(user.sub, Date.now())
    channels.set(channel, p)
    wsGauge.set({ channel }, p.users.size)
    io.to(channel).emit('presence', { count: p.users.size })
  })
  socket.on('typing', async ({ channel })=>{
    const user = (socket as any).data?.user
    if(!user) return
    const allowed = (await getAllowedRoles(channel)).map(String).map(s=>s.toLowerCase())
    const hasRole = (user.roles||[]).some((r:string)=> allowed.includes(r))
    const hasPolicy = hasUmaPermission((socket as any).data?.user, `channel:${channel}`, 'type')
    if(!(hasRole || hasPolicy)) return
    io.to(channel).emit('typing', { users: [user.sub] })
  })
  socket.on('disconnecting', ()=>{
    const user = (socket as any).data?.user
    if(!user) return
    for(const channel of socket.rooms){
      const p = channels.get(channel); if(!p) continue
      p.users.delete(user.sub)
      wsGauge.set({ channel }, p.users.size)
    }
  })
})

// REST fallbacks with ACL
app.post('/realtime/typing', async (req,res)=>{
  try{
    const payload = await verifyToken(req.headers.authorization as string)
    const roles = extractRoles(payload)
    const { channel } = req.body||{}
    const allowed = (await getAllowedRoles(channel)).map(String).map(s=>s.toLowerCase())
    const hasPolicy = hasUmaPermission(payload, `channel:${channel}`, 'type')
    if(!(roles.some(r=>allowed.includes(r)) || hasPolicy)) return res.status(403).json({ ok:false, error:'forbidden' })
    io.to(channel).emit('typing', { users: [payload.sub] })
    res.json({ ok:true })
  }catch(_){ authFailures.inc(); res.status(401).json({ ok:false }) }
})

app.post('/realtime/send', async (req,res)=>{
  try{
    const payload = await verifyToken(req.headers.authorization as string)
    const roles = extractRoles(payload)
    const { channel, text } = req.body||{}
    const allowed = (await getAllowedRoles(channel)).map(String).map(s=>s.toLowerCase())
    const hasPolicy = hasUmaPermission(payload, `channel:${channel}`, 'send')
    if(!(roles.some(r=>allowed.includes(r)) || hasPolicy)) return res.status(403).json({ ok:false, error:'forbidden' })
    msgCounter.inc()
    io.to(channel).emit('message', { userId: payload.sub, text })
    await prisma.auditLog.create({ data:{ actorId: String(payload.sub||''), action:'realtime.send', data:{ channel } } })
    res.json({ ok:true })
  }catch(_){ authFailures.inc(); res.status(401).json({ ok:false }) }
})

// ---- Admin: manage ACL ----
app.get('/admin/acl/list', async (_req,res)=>{
  const rows = await prisma.channelAcl.findMany({ orderBy:{ updatedAt:'desc' } })
  res.json(rows.map(r=> ({ channel: r.channel, roles: (r.roles as any) || [] })))
})
app.post('/admin/acl/set', async (req,res)=>{
  const { channel, roles=[] } = req.body||{}
  const r = await prisma.channelAcl.upsert({ where:{ channel }, update:{ roles }, create:{ channel, roles } })
  await prisma.auditLog.create({ data:{ actorId: 'admin', action:'acl.set', data:{ channel, roles } } })
  res.json({ ok:true, channel: r.channel, roles: r.roles })
})

// ---- Ranker: PageRank feature from Neo4j (GDS) ----
async function pageRankFeature(jobId: string): Promise<number>{
  if(!neo) return 0
  const session = neo.session({ database: neoDb })
  try{
    const cypher = `MATCH (j:${jobLabel} {${jobIdKey}: $id}) RETURN coalesce(j.${prProp}, 0.0) as pr LIMIT 1`
    const res = await session.run(cypher, { id: jobId })
    const rec = res.records[0]
    return rec ? Number(rec.get('pr'))||0 : 0
  }finally{
    await session.close()
  }
}

function scoreGraph(job:any, pSkills:Set<string>){
  const j = (job.skills||[]).map((js:any)=> js.skill.name.toLowerCase())
  const overlap = j.filter((s:string)=> pSkills.has(s)).length
  const norm = Math.max(j.length, 1)
  const recency = Math.max(1, (Date.now()-new Date(job.createdAt).getTime())/86400000)
  return (overlap/norm) * (1/recency)
}

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

// ---- Payments: HyperPay webhook + status, Tap webhook ----
app.post('/payments/hyperpay/webhook', async (req,res)=>{
  // HyperPay can POST notifications; validate signature according to their docs if enabled (not implemented here)
  await prisma.auditLog.create({ data:{ actorId: 'system', action:'hyperpay.webhook', data: req.body } })
  res.json({ ok:true })
})
app.get('/payments/hyperpay/status', async (req,res)=>{
  // Merchant polls status with resourcePath or id
  const resourcePath = String(req.query.resourcePath||'')
  const accessToken = process.env.HYPERPAY_ACCESS_TOKEN||''
  const testMode = String(process.env.HYPERPAY_TEST_MODE||'true')==='true'
  const base = testMode ? 'https://eu-test.oppwa.com' : 'https://oppwa.com'
  const r = await fetch(base+resourcePath, { headers:{ 'Authorization': accessToken } })
  const dj = await r.json().catch(()=>({}))
  await prisma.auditLog.create({ data:{ actorId: 'system', action:'hyperpay.status', data: dj } })
  res.json(dj)
})

app.post('/payments/tap/webhook', async (req,res)=>{
  // Verify Tap signature if configured (x-tap-signature). For demo we just log.
  await prisma.auditLog.create({ data:{ actorId: 'system', action:'tap.webhook', data: req.body } })
  res.json({ ok:true })
})

app.post('/rewards/ledger/add', async (req,res)=>{
  const { userId, delta, reason } = req.body||{}
  await prisma.user.upsert({ where:{ id:userId }, update:{}, create:{ id:userId, email: userId+'@local' } })
  const row = await prisma.pointsLedger.create({ data:{ userId, delta: Number(delta||0), reason: reason||'manual' } })
  res.json({ ok:true, id: row.id })
})

// ---- Admin: bans/safety/reports/audit ----
app.get('/admin/audit/list', async (_req,res)=>{
  const rows = await prisma.auditLog.findMany({ orderBy:{ createdAt:'desc' }, take: 200 })
  res.json(rows)
})

app.get('/health', (_req,res)=> res.json({ ok:true, v:'2.8' }))

server.listen(port, ()=> console.log('API v2.8 listening on', port))
