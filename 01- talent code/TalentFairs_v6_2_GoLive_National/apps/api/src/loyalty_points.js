import { Router } from 'express'
export const router = Router()
const DB = []

router.post('/award', (req,res)=>{
  const { userId, points=0, event='manual' } = req.body||{}
  if(!userId) return res.status(400).json({ ok:false, error:'userId required' })
  const row = { id: Math.random().toString(36).slice(2), userId, points:Number(points), event, ts: Date.now() }
  DB.push(row)
  const total = DB.filter(r=>r.userId===userId).reduce((a,b)=>a+b.points,0)
  res.json({ ok:true, awarded: row.points, total })
})

router.get('/balance', (req,res)=>{
  const userId = String(req.query.userId || 'demo')
  const total = DB.filter(r=>r.userId===userId).reduce((a,b)=>a+b.points,0)
  res.json({ ok:true, userId, total, entries: DB.filter(r=>r.userId===userId) })
})
