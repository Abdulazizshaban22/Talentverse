import express from 'express'
import crypto from 'crypto'
import fetch from 'node-fetch'
export const payhooks = express.Router()

// ---- Tap: validate 'hashstring' header (HMAC-SHA256) ----
function verifyTap(signature, body){
  const secret = process.env.TAP_WEBHOOK_SECRET || ''
  const computed = crypto.createHmac('sha256', secret).update(body).digest('hex')
  return (signature||'').toLowerCase() === computed.toLowerCase()
}

payhooks.post('/tap', express.raw({type:'application/json'}), async (req,res)=>{
  const sig = req.headers['hashstring']
  const raw = req.body.toString('utf8')
  if(!verifyTap(sig, raw)) return res.status(400).json({ ok:false, reason:'bad_signature' })
  const event = JSON.parse(raw)
  // TODO: update subscription/enrollment status based on event.object & event.status
  return res.json({ ok:true })
})

// ---- HyperPay (OPPWA): verify by fetching payment status ----
// If you also have signature verification, add it here per your OPP setup.
async function getOppPayment(id){
  const base = process.env.HYPERPAY_BASE || 'https://eu-prod.oppwa.com'
  const user = process.env.HYPERPAY_USER_ID
  const pwd  = process.env.HYPERPAY_PASSWORD
  const entity = process.env.HYPERPAY_ENTITY_ID
  const url = `${base}/v1/payments/${id}?authentication.userId=${encodeURIComponent(user)}&authentication.password=${encodeURIComponent(pwd)}&authentication.entityId=${encodeURIComponent(entity)}`
  const r = await fetch(url, { method:'GET' })
  return await r.json()
}

payhooks.post('/hyperpay', express.json(), async (req,res)=>{
  const { id } = req.body || {}
  if(!id) return res.status(400).json({ ok:false })
  const status = await getOppPayment(id).catch(()=>null)
  if(!status || !status.result || !status.result.code) return res.status(400).json({ ok:false })
  // Example: codes starting with '000.000.000' indicate success for OPP
  const ok = (status.result.code||'').startsWith('000.')
  // TODO: update subscription/enrollment based on 'ok' and amount/currency/reference
  return res.json({ ok, status })
})
