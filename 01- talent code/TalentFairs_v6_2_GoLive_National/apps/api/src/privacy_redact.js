import { Router } from 'express'
export const router = Router()

function maskEmail(t){ return t.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, m=> m[0]+'***@'+m.split('@')[1]) }
function maskPhone(t){ return t.replace(/(?:\+?\d{1,3})?\s?\d{2,3}[\s-]?\d{3,4}[\s-]?\d{3,4}/g, m=> m[0]+'****'+m.slice(-2)) }

router.post('/redact', (req,res)=>{
  const text = String(req.body?.text || '')
  const redacted = maskPhone(maskEmail(text))
  res.json({ ok:true, redacted })
})
