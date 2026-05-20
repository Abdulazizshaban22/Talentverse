import { Router } from 'express'
export const router = Router()

function maskEmail(s){
  return s.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, m => {
    const [u, d] = m.split('@'); return u[0] + '***@' + d
  })
}
function maskPhone(s){
  return s.replace(/(?:\+?\d{1,3})?\s?\d{2,3}[\s-]?\d{3,4}[\s-]?\d{3,4}/g, m => m[0] + '****' + m.slice(-2))
}

router.post('/redact', (req, res)=>{
  const text = String(req.body?.text || '')
  const red = maskPhone(maskEmail(text))
  res.json({ ok:true, redacted: red })
})
