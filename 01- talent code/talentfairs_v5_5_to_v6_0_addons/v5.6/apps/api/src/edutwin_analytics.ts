import { Router } from 'express'
export const edutwinRouter = Router()

// Ingest xAPI/Caliper-like events (lite)
edutwinRouter.post('/ingest', (req:any,res:any)=>{
  const ev = req.body || {}
  // TODO: persist via Prisma. Demo only:
  res.json({ ok:true, accepted:true, verb: ev.verb, object: ev.object })
})

// Compute simple KPIs (demo): engagement score
edutwinRouter.get('/metrics/engagement', (req:any,res:any)=>{
  const learner = String(req.query.learnerId || 'demo')
  const score = Math.round(Math.random()*40)+60 // demo
  res.json({ ok:true, learnerId: learner, metric:'engagement', score })
})
