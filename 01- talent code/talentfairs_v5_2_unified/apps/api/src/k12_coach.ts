import { Router } from 'express'
export const k12Router = Router()
const DAILY = [
  { id:'t1', title:'قراءة 10 دقائق', points:5 },
  { id:'t2', title:'تمرين رياضي 10 دقائق', points:5 },
  { id:'t3', title:'حل مسألة منطقية', points:7 },
]
k12Router.get('/coach/today', (_req:any, res:any)=> res.json({ ok:true, date:new Date().toISOString().slice(0,10), tasks: DAILY }))
k12Router.get('/coach/guardian-tips', (_req:any,res:any)=> res.json({ ok:true, tips: ['تابع ابنك أثناء القراءة','امتدح الجهد لا النتيجة','كافئ السلوك الإيجابي'] }))
