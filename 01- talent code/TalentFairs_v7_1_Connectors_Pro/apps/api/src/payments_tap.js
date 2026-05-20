import fetch from 'node-fetch'
import crypto from 'crypto'

const TAP_API = process.env.TAP_API || 'https://api.tap.company'
const TAP_KEY = process.env.TAP_SECRET_KEY || ''  // sk_test_... / sk_live_...
const TAP_WEBHOOK_SECRET = process.env.TAP_WEBHOOK_SECRET || ''

// Create a charge
export async function tapCreateCharge({ amount, currency='SAR', customer, source='src_all' }){
  const r = await fetch(`${TAP_API}/v2/charges/`, {
    method:'POST',
    headers:{ 'Authorization': `Bearer ${TAP_KEY}`, 'Content-Type':'application/json' },
    body: JSON.stringify({
      amount, currency,
      source: { id: source },
      customer,
      description: 'TalentFairs LMS purchase'
    })
  })
  return await r.json()
}

// Verify webhook HMAC (Tap: hashstring in header, SHA256 with secret)
export function verifyTapWebhook(signature, rawBody){
  const computed = crypto.createHmac('sha256', TAP_WEBHOOK_SECRET).update(rawBody).digest('hex')
  return (signature || '').toLowerCase() == computed.toLowerCase()
}
