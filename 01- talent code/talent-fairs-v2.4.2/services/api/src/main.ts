import express from 'express'
import { PrismaClient } from '@prisma/client'
import { stringify } from 'csv-stringify/sync'

const app = express(); app.use(express.json())
const prisma = new PrismaClient()

app.get('/health', (_req,res)=> res.json({ ok:true, v:'2.4.2' }))

// ---- Admin Jobs ----
app.get('/admin/jobs', async (_req,res)=>{
  const list = await prisma.job.findMany({ orderBy:{ createdAt:'desc' }, take: 200 })
  res.json(list)
})
app.post('/jobs/create', async (req,res)=>{
  const { title, company, description, skills=[] } = req.body||{}
  const job = await prisma.job.create({ data:{ title, company, description } })
  for(const s of skills){
    const sk = await prisma.skill.upsert({ where:{ name:s }, update:{}, create:{ name:s } })
    await prisma.jobSkill.upsert({ where:{ jobId_skillId: { jobId: job.id, skillId: sk.id }}, update:{}, create:{ jobId: job.id, skillId: sk.id, weight: 1 } })
  }
  res.json(job)
})

// ---- Challenges (reuse minimal from earlier) ----
app.get('/challenges/list', async (_req,res)=>{
  const list = await prisma.challenge.findMany({ where:{ active:true }, include:{ tasks:true } })
  res.json(list)
})
app.post('/challenges/create', async (req,res)=>{
  const { title, description, period='weekly', tasks=[] } = req.body||{}
  const c = await prisma.challenge.create({ data:{ title, description, period, active:true } })
  for(const t of tasks){ await prisma.challengeTask.create({ data:{ challengeId: c.id, title: t.title, points: t.points||10 } }) }
  res.json({ ok:true, id:c.id })
})

// ---- Messaging ----
app.post('/messages/send', async (req,res)=>{
  const { fromUserId, toUserId, body } = req.body||{}
  const m = await prisma.message.create({ data:{ fromUserId, toUserId, body } })
  res.json({ ok:true, id:m.id })
})
app.get('/messages/inbox', async (req,res)=>{
  const userId = String(req.query.userId||'')
  const list = await prisma.message.findMany({ where:{ toUserId: userId }, orderBy:{ createdAt:'desc' }, take: 100 })
  res.json(list)
})

// ---- Rewards ----
app.post('/rewards/create', async (req,res)=>{
  const { title, points } = req.body||{}
  const r = await prisma.reward.create({ data:{ title, points } })
  res.json(r)
})
app.get('/rewards/list', async (_req,res)=>{
  const list = await prisma.reward.findMany({ where:{ active:true }, orderBy:{ createdAt:'desc' } })
  res.json(list)
})
app.post('/rewards/redeem', async (req,res)=>{
  const { rewardId, userId } = req.body||{}
  const r = await prisma.reward.findUnique({ where:{ id: rewardId } })
  if(!r) return res.status(404).json({ ok:false, error:'reward_not_found' })
  // deduct user points (simple optimistic)
  await prisma.user.upsert({ where:{ id:userId }, update:{ points:{ decrement: r.points } }, create:{ id:userId, email: userId+'@local', points: 0, role: 'talent' } })
  const red = await prisma.redemption.create({ data:{ rewardId, userId } })
  res.json({ ok:true, redemptionId: red.id })
})

// ---- Feature CSV (toy example) ----
// Build simple features for (user, job): overlap ratio + job recency days
app.get('/features/sample-csv', async (_req,res)=>{
  const users = await prisma.profile.findMany({ include:{ skills:{ include:{ skill:true } } }, take: 50 })
  const jobs  = await prisma.job.findMany({ include:{ skills:{ include:{ skill:true } } }, take: 50 })
  const rows: any[] = []
  let qid=0
  for(const u of users){
    qid++
    const uSkills = new Set((u.skills||[]).map(s=> s.skill.name.toLowerCase()))
    for(const j of jobs){
      const jSkills = (j.skills||[]).map(s=> s.skill.name.toLowerCase())
      const overlap = jSkills.filter(s=> uSkills.has(s)).length
      const ratio = overlap / Math.max(jSkills.length, 1)
      const recencyDays = Math.max(1, Math.floor((Date.now()-new Date(j.createdAt).getTime())/86400000))
      // label placeholder (0/1) - real world: clicks/applies/accepts
      const label = ratio >= 0.5 ? 1 : 0
      rows.push({ qid, label, f1: ratio, f2: 1/recencyDays })
    }
  }
  const csv = stringify(rows, { header: true })
  res.setHeader('Content-Type','text/csv; charset=utf-8')
  res.send(csv)
})

const port = Number(process.env.PORT_API||4000)
app.listen(port, ()=> console.log('API v2.4.2 listening on', port))
