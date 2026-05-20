import { Router } from 'express'
export const trustRouter = Router()
type Report = { id:string, type:string, targetId:string, payload:any, ts:number }
const REPORTS:Report[] = [
  { id:'r1', type:'abuse', targetId:'user_123', payload:{reason:'spam'}, ts: Date.now() }
]
trustRouter.get('/reports', (_req:any,res:any)=> res.json({ ok:true, reports: REPORTS }))
