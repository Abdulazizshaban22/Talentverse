
import { Router } from 'express'
import crypto from 'crypto'
export const router = Router()

function hmacSHA256(secret, payload){
  return crypto.createHmac('sha256', secret).update(payload, 'utf8').digest('hex')
}

router.post('/tap/webhook', (req,res)=>{
  const sig = req.headers['tap-signature']
  const secret = process.env.TAP_SECRET || ''
  const payload = JSON.stringify(req.body||{})
  const expected = hmacSHA256(secret, payload)
  if (sig !== expected) return res.status(401).json({ ok:false, error:'BAD_SIGNATURE' })
  res.json({ ok:true })
})

router.post('/hyperpay/webhook', (req,res)=>{
  const key = process.env.HYPERPAY_CHECKSUM_KEY || ''
  const payload = JSON.stringify(req.body||{})
  const provided = req.headers['x-hp-signature'] || req.query.signature || ''
  const expected = hmacSHA256(key, payload)
  if (!provided || provided != expected) return res.status(401).json({ ok:false, error:'BAD_SIGNATURE' })
  res.json({ ok:true })
})
