import express from 'express'
import http from 'http'
import { Server as IOServer } from 'socket.io'
import { PrismaClient } from '@prisma/client'
import fetch from 'node-fetch'
import Stripe from 'stripe'
import client from 'prom-client'

const prisma = new PrismaClient()
const app = express()
const server = http.createServer(app)
const io = new IOServer(server, { cors: { origin: '*' } })

app.use(express.json())
const port = Number(process.env.PORT_API||4000)

// ---- Prometheus metrics ----
const register = new client.Registry()
client.collectDefaultMetrics({ register })
const msgCounter = new client.Counter({ name:'tf_messages_total', help:'Messages sent', registers:[register] })
const redeemCounter = new client.Counter({ name:'tf_rewards_redeemed_total', help:'Rewards redeemed', registers:[register] })
app.get('/metrics', async (_req,res)=>{
  res.setHeader('Content-Type', register.contentType)
  res.end(await register.metrics())
})

// ---- Realtime Pro: channels + presence + typing ----
type Presence = { users: Map<string, number> } // userId -> lastPing
const channels: Map<string, Presence> = new Map()

io.on('connection', (socket)=>{
  socket.on('join', ({ channel, userId })=>{
    socket.join(channel)
    const p = channels.get(channel) || { users: new Map() }
    p.users.set(userId, Date.now())
    channels.set(channel, p)
    io.to(channel).emit('presence', { count: p.users.size })
  })
  socket.on('leave', ({ channel, userId })=>{
    socket.leave(channel)
    const p = channels.get(channel); if(!p) return
    p.users.delete(userId)
    io.to(channel).emit('presence', { count: p.users.size })
  })
  socket.on('typing', ({ channel, userId })=>{
    io.to(channel).emit('typing', { users: [userId] })
  })
})

// Keep presence fresh via API pings also
app.post('/realtime/typing', (req,res)=>{
  const { channel, userId } = req.body||{}
  io.to(channel).emit('typing', { users: [userId] })
  res.json({ ok:true })
})
app.post('/realtime/send', async (req,res)=>{
  const { channel, userId, text } = req.body||{}
  msgCounter.inc()
  io.to(channel).emit('message', { userId, text })
  await prisma.auditLog.create({ data:{ actorId: userId, action:'realtime.send', data:{ channel } } })
  res.json({ ok:true })
})
app.post('/realtime/presence', (req,res)=>{
  const { channel, userId } = req.body||{}
  const p = channels.get(channel) || { users: new Map() }
  p.users.set(userId, Date.now())
  channels.set(channel, p)
  io.to(channel).emit('presence', { count: p.users.size })
  res.json({ ok:true, count: p.users.size })
})

// ---- Combined Ranker (Graph + LTR) ----
function scoreGraph(job:any, pSkills:Set<string>){
  const j = (job.skills||[]).map((js:any)=> js.skill.name.toLowerCase())
  const overlap = j.filter((s:string)=> pSkills.has(s)).length
  const norm = Math.max(j.length, 1)
  const recency = Math.max(1, (Date.now()-new Date(job.createdAt).getTime())/86400000)
  return (overlap/norm) * (1/recency)
}

app.get('/recs/combined', async (req,res)=>{
  const userId = String(req.query.userId||'')
  const wGraph = Number(process.env.COMBINE_W_GRAPH||0.6)
  const wLTR   = Number(process.env.COMBINE_W_LTR||0.4)
  const profile = await prisma.profile.findFirst({ where:{ userId }, include:{ skills:{ include:{ skill:true } } } })
  if(!profile) return res.json([])
  const jobs = await prisma.job.findMany({ include:{ skills:{ include:{ skill:true } } }, take: 100, orderBy:{ createdAt:'desc' } })
  const pSkills = new Set(profile.skills.map(ps=> ps.skill.name.toLowerCase()))
  const features:number[][] = []
  const base = jobs.map(j=>{
    const g = scoreGraph(j, pSkills)
    // Features like v2.4.x: ratio + recency inverse
    const jskills = (j.skills||[]).map((s:any)=> s.skill.name.toLowerCase())
    const ratio = jskills.filter((s:string)=> pSkills.has(s)).length / Math.max(jskills.length,1)
    const recInv = 1/Math.max(1,(Date.now()-new Date(j.createdAt).getTime())/86400000)
    features.push([ratio, recInv])
    return { job:j, g }
  })

  // Call ai-match if reachable
  let ltrScores:number[] = Array(jobs.length).fill(0)
  try{
    const aiUrl = (process.env.AI_MATCH_URL||'http://localhost:8600').replace(/\/$/,'')
    const r = await fetch(aiUrl+'/predict', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ features }) })
    const dj = await r.json()
    if(dj && dj.ok && Array.isArray(dj.scores)) ltrScores = dj.scores.map((x:any)=> Number(x)||0)
    else ltrScores = features.map(f=> f[0]) // fallback to ratio as LTR proxy
  }catch(_){ ltrScores = features.map(f=> f[0]) }

  const ranked = base.map((b, i)=>{
    const combined = wGraph * b.g + wLTR * ltrScores[i]
    return { id: b.job.id, title:b.job.title, company:b.job.company, score: combined }
  }).sort((a,b)=> b.score - a.score).slice(0, 20)

  res.json(ranked)
})

// ---- Payments: Stripe webhook verification (official SDK) ----
app.post('/payments/stripe/webhook', express.raw({ type: '*/*' }), (req, res)=>{
  const sig = req.headers['stripe-signature'] as string||''
  const secret = process.env.STRIPE_SIGNING_SECRET||''
  const stripe = new Stripe('sk_test_xxx', { apiVersion: '2024-06-20' })
  try{
    const event = stripe.webhooks.constructEvent(req.body, sig, secret)
    // handle event.type (payment_intent.succeeded, charge.refunded, ...)
    // ... add ledger/audit if needed
    return res.json({ ok:true, type: event.type })
  }catch(e:any){
    return res.status(400).json({ ok:false, error:'invalid_signature', message: e.message })
  }
})

// ---- Rewards + Ledger + Coupons (from v2.5, enhanced) ----
app.post('/rewards/redeem', async (req,res)=>{
  const { rewardId, userId, couponCode=null } = req.body||{}
  const r = await prisma.reward.findUnique({ where:{ id: rewardId } })
  if(!r) return res.status(404).json({ ok:false, error:'reward_not_found' })
  let cost = r.points
  if(couponCode){
    const c = await prisma.coupon.findUnique({ where:{ code: couponCode } })
    if(c && c.active){
      if(typeof c.points === 'number'){ cost = Math.max(0, cost - c.points) }
      if(typeof c.percent === 'number'){ cost = Math.round(cost * (100 - c.percent)/100) }
    }
  }
  await prisma.user.upsert({ where:{ id:userId }, update:{ points:{ decrement: cost } }, create:{ id:userId, email: userId+'@local', points: 0, role: 'talent' } })
  await prisma.pointsLedger.create({ data:{ userId, delta: -cost, reason: 'reward_redeem' } })
  const red = await prisma.redemption.create({ data:{ rewardId, userId } })
  await prisma.auditLog.create({ data:{ actorId:userId, action:'reward.redeem', data:{ rewardId, cost } } })
  redeemCounter.inc()
  return res.json({ ok:true, redemptionId: red.id, cost })
})

// ---- Trust & Safety: bans + reports + safety review ----
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
app.post('/reports/create', async (req,res)=>{
  const { reporterId=null, entityType, entityId, reason } = req.body||{}
  const r = await prisma.report.create({ data:{ reporterId, entityType, entityId, reason } })
  await prisma.auditLog.create({ data:{ actorId: reporterId||undefined, action:'report.create', data:{ entityType, entityId } } })
  res.json(r)
})
app.post('/reports/update', async (req,res)=>{
  const { id, status } = req.body||{}
  const r = await prisma.report.update({ where:{ id }, data:{ status } })
  await prisma.auditLog.create({ data:{ actorId: 'admin', action:'report.update', data:{ id, status } } })
  res.json(r)
})
app.get('/admin/audit/list', async (_req,res)=>{
  const rows = await prisma.auditLog.findMany({ orderBy:{ createdAt:'desc' }, take: 200 })
  res.json(rows)
})

// ---- Health ----
app.get('/health', (_req,res)=> res.json({ ok:true, v:'2.6' }))

server.listen(port, ()=> console.log('API v2.6 listening on', port))
