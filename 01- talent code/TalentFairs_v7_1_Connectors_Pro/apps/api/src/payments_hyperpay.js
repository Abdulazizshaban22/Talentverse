import fetch from 'node-fetch'
import crypto from 'crypto'

const BASE = process.env.HYPERPAY_BASE || 'https://eu-prod.oppwa.com'
const ENTITY_ID = process.env.HYPERPAY_ENTITY_ID || ''
const TOKEN = process.env.HYPERPAY_TOKEN || ''

// Create checkout session
export async function hyperpayCheckout({ amount, currency='SAR', shopperResultUrl }){
  const params = new URLSearchParams()
  params.append('entityId', ENTITY_ID)
  params.append('amount', String(amount))
  params.append('currency', currency)
  params.append('paymentType', 'DB')
  params.append('merchantTransactionId', 'tf-'+Date.now())
  params.append('shopperResultUrl', shopperResultUrl)

  const r = await fetch(`${BASE}/v1/checkouts`, {
    method:'POST',
    headers:{ 'Authorization': `Bearer ${TOKEN}`, 'Content-Type':'application/x-www-form-urlencoded' },
    body: params
  })
  const j = await r.json()
  return j // contains checkoutId
}

// Webhook verify (signature style varies per account setup; stub)
export function verifyHyperPaySignature(headers, body){
  // Implement per HyperPay agreement (HMAC/Keyed signature if available)
  return true
}
