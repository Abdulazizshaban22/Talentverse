import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import http from 'http'

import { socialFeed } from './social_feed_opensearch.js'
import { search } from './search_opensearch.js'
import { initRealtime } from './realtime.js'
import { hyperpayCheckout } from './payments_hyperpay.js'
import { tapCreateCharge, verifyTapWebhook } from './payments_tap.js'
import { identity } from './identity_badges.js'

const app = express()
const server = http.createServer(app)
app.use(cors())
app.use(bodyParser.json({limit:'2mb'}))

// Health
app.get('/health', (_req,res)=> res.json({ ok:true, service:'tf-api-7.1', ts: Date.now() }))

// Social + Search (OpenSearch)
app.use('/social', socialFeed)
app.use('/search', search)

// Identity + Badges
app.use('/identity', identity)

// Payments
app.post('/payments/hyperpay/checkout', async (req,res)=>{
  const { amount, currency, returnUrl } = req.body||{}
  const out = await hyperpayCheckout({ amount, currency, shopperResultUrl: returnUrl })
  res.json({ ok:true, checkout: out })
})

app.post('/payments/tap/charge', async (req,res)=>{
  const { amount, currency, customer } = req.body||{}
  const out = await tapCreateCharge({ amount, currency, customer })
  res.json({ ok:true, charge: out })
})

app.post('/payments/tap/webhook', express.raw({type:'application/json'}), (req,res)=>{
  const sig = req.headers['hashstring']
  const raw = req.body.toString('utf8')
  const ok = verifyTapWebhook(sig, raw)
  if(!ok) return res.status(400).json({ ok:false })
  // TODO: update order/subscription status
  return res.json({ ok:true })
})

// Start HTTP + Realtime
const PORT = process.env.PORT || 4000
server.listen(PORT, ()=> console.log('TalentFairs API 7.1 on http://localhost:'+PORT))

// Socket.IO realtime
initRealtime(server)
