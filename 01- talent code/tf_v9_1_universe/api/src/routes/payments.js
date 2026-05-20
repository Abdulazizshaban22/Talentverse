
import { Router } from 'express'
import crypto from 'crypto'
export const router = Router()

// Tap.io signature (example header: tap-signature)
router.post('/tap/webhook', (req,res)=>{
  const sig = req.headers['tap-signature']
  const secret = process.env.TAP_SECRET || ''
  const payload = JSON.stringify(req.body||{})
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  if (sig !== expected) return res.status(401).json({ ok:false, error:'BAD_SIGNATURE' })
  // TODO: update subscription/course status
  res.json({ ok:true })
})

// HyperPay (simplified validation placeholder)
router.post('/hyperpay/webhook', (req,res)=>{
  // TODO: implement per HyperPay docs (checksum / token)
  res.json({ ok:true })
})
