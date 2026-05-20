import { Router } from 'express'
export const redactionRouter = Router()
function redact(t:string){
  t = (t||'')
  t = t.replace(/\b([A-Za-z0-9._%+-])([A-Za-z0-9._%+-]*?)@([A-Za-z0-9.-]+\.[A-Za-z]{2,})\b/g, (_m,p1,_p2,p3)=> p1+'***@'+p3)
  t = t.replace(/\b[12]\d{9}\b/g, '**********')   // Saudi National ID simple mask
  t = t.replace(/\b(00966|\+966|0)?\d{8,11}\b/g, '********') // phones
  return t
}
redactionRouter.post('/redact',(req:any,res:any)=>{
  const text=String(req.body?.text||''); res.json({ok:true, redacted: redact(text)})
})
