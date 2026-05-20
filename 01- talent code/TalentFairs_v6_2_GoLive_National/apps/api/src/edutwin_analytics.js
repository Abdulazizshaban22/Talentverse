import { Router } from 'express'
export const router = Router()

router.post('/ingest', (req,res)=>{
  // TODO: persist to DB with tenant_id
  res.json({ ok:true, accepted:true, verb:req.body?.verb, object:req.body?.object })
})

router.get('/metrics/engagement', (req,res)=>{
  const learnerId = String(req.query.learnerId || 'demo')
  const score = Math.round(Math.random()*40)+60
  res.json({ ok:true, learnerId, metric:'engagement', score })
})
