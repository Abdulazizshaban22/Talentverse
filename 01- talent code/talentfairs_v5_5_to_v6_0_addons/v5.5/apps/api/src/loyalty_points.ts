import { Router } from 'express'
export const loyaltyRouter = Router()

type Row = { id:string, userId:string, points:number, event:string, ts:number }
const DB: Row[] = []

loyaltyRouter.post('/award', (req:any,res:any)=>{
  const { userId, points, event } = req.body || {}
  if(!userId || !points) return res.status(400).json({ ok:false, error:'missing_fields' })
  const row: Row = { id: Math.random().toString(36).slice(2), userId, points:Number(points), event:String(event||'manual'), ts:Date.now() }
  DB.push(row)
  res.json({ ok:true, awarded: row.points, total: DB.filter(r=>r.userId===userId).reduce((a,b)=>a+b.points,0) })
})

loyaltyRouter.get('/balance', (req:any,res:any)=>{
  const userId = String(req.query.userId || 'demo')
  const total = DB.filter(r=>r.userId===userId).reduce((a,b)=>a+b.points,0)
  res.json({ ok:true, userId, total, entries: DB.filter(r=>r.userId===userId) })
})
