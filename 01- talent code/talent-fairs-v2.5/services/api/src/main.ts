import express from 'express'
import { PrismaClient } from '@prisma/client'

const app = express()
app.use(express.json())
const prisma = new PrismaClient()

// ---- SSE ----
type Client = { id:string, res:any }
const clients: Client[] = []
function broadcast(data: any){
  const line = typeof data === 'string' ? data : JSON.stringify(data)
  for(const c of clients){ c.res.write(`data: ${line}\n\n`) }
}
app.get('/events/stream', (req,res)=>{
  res.setHeader('Content-Type','text/event-stream')
  res.setHeader('Cache-Control','no-cache')
  res.setHeader('Connection','keep-alive')
  res.flushHeaders?.()
  const id = Math.random().toString(36).slice(2)
  clients.push({ id, res })
  req.on('close', ()=>{
    const i = clients.findIndex(c=> c.id===id)
    if(i>=0) clients.splice(i,1)
  })
})

app.get('/health', (_req,res)=> res.json({ ok:true, v:'2.5' }))

// ---- Moderation (simple demo) ----
const banned = ['شتيمة','سب','كلمة_سيئة','offensive']
async function moderate(text: string){
  const t = (text||'').toLowerCase()
  const hits = banned.filter(w=> t.includes(w))
  return { flagged: hits.length>0, reason: hits.join(', ') }
}

// ---- Messaging ----
app.post('/messages/send', async (req,res)=>{
  const { fromUserId, toUserId, body } = req.body||{}
  const mod = await moderate(body||'')
  const m = await prisma.message.create({ data:{ fromUserId, toUserId, body, flagged: mod.flagged } })
  if(mod.flagged){
    await prisma.safetyFlag.create({ data:{ entityType:'message', entityId: m.id, reason: `banwords: ${mod.reason}`, severity: 2 } })
  }
  broadcast({ type:'message', id:m.id, from:fromUserId, to:toUserId })
  res.json({ ok:true, id:m.id, flagged: mod.flagged })
})
app.get('/messages/inbox', async (req,res)=>{
  const userId = String(req.query.userId||'')
  const list = await prisma.message.findMany({ where:{ toUserId: userId }, orderBy:{ createdAt:'desc' }, take: 100 })
  res.json(list)
})

// ---- Rewards + Coupons ----
app.post('/rewards/create', async (req,res)=>{
  const { title, points } = req.body||{}
  const r = await prisma.reward.create({ data:{ title, points } })
  res.json(r)
})
app.get('/rewards/list', async (_req,res)=>{
  const list = await prisma.reward.findMany({ where:{ active:true }, orderBy:{ createdAt:'desc' } })
  res.json(list)
})
app.post('/coupons/create', async (req,res)=>{
  const { code, percent=null, points=null } = req.body||{}
  const c = await prisma.coupon.create({ data:{ code, percent, points } })
  res.json(c)
})
app.get('/coupons/list', async (_req,res)=>{
  const list = await prisma.coupon.findMany({ where:{ active:true }, orderBy:{ createdAt:'desc' } })
  res.json(list)
})
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
  const red = await prisma.redemption.create({ data:{ rewardId, userId } })
  broadcast({ type:'reward_redeemed', rewardId, userId, cost })
  res.json({ ok:true, redemptionId: red.id, cost })
})

// ---- Admin Safety ----
app.get('/admin/safety/list', async (_req,res)=>{
  const list = await prisma.safetyFlag.findMany({ orderBy:{ createdAt:'desc' }, take: 200 })
  res.json(list)
})

// ---- Graph recs (fallback co-occurrence) ----
app.get('/recs/graph', async (req,res)=>{
  const userId = String(req.query.userId||'')
  const profile = await prisma.profile.findFirst({ where:{ userId }, include:{ skills: { include:{ skill:true } } } })
  if(!profile) return res.json([])
  const jobs = await prisma.job.findMany({ include:{ skills:{ include:{ skill:true } } }, take: 100, orderBy:{ createdAt:'desc' } })
  const pSkills = new Set(profile.skills.map(ps=> ps.skill.name.toLowerCase()))
  function score(job:any){
    const j = job.skills.map((js:any)=> js.skill.name.toLowerCase())
    const overlap = j.filter((s:string)=> pSkills.has(s)).length
    const norm = Math.max(j.length, 1)
    const recency = Math.max(1, (Date.now()-new Date(job.createdAt).getTime())/86400000)
    return (overlap/norm) * (1/recency)
  }
  const ranked = jobs.map(j=> ({ id:j.id, title:j.title, company:j.company, score: score(j) }))
                    .filter(x=> x.score>0).sort((a,b)=> b.score - a.score).slice(0, 20)
  res.json(ranked)
})

// ---- Stripe webhook scaffold (dev-friendly) ----
app.post('/payments/stripe/webhook', express.text({ type: '*/*' }), async (req,res)=>{
  const sig = req.header('stripe-signature') || ''
  const hasSecret = !!process.env.STRIPE_SIGNING_SECRET
  // In production: use Stripe SDK to verify signature with STRIPE_SIGNING_SECRET
  // Here: accept and log for development
  console.log('Stripe webhook received. sig:', !!sig, 'len=', req.body?.length||0, 'hasSecret:', hasSecret)
  return res.status(200).json({ ok:true, received:true, verified:false })
})

const port = Number(process.env.PORT_API||4000)
app.listen(port, ()=> console.log('API v2.5 listening on', port))
