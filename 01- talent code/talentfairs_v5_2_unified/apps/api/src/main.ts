import express from 'express'
import crypto from 'crypto'
import { fusionRouter } from './ai_fusion_ranker.js'
import { whatifRouter } from './ai_whatif.js'
import { redactionRouter } from './privacy_redaction.js'
import { endorseRouter } from './social_endorsements.js'
import { scholarshipsRouter } from './scholarships_matcher.js'
import { k12Router } from './k12_coach.js'
import { schoolRouter } from './school_oneroster.js'
import { govRouter } from './gov_adapters.js'
import { hyperpayVerify } from './payments_hyperpay.js'
import { tapWebhook } from './payments_tap.js'
import { zatcaRouter } from './compliance_zatca.js'
import { trustRouter } from './trust_safety.js'

const app = express()

// Raw body only for Tap webhook
app.post('/payments/tap/webhook', express.raw({ type: '*/*' }), tapWebhook)

// JSON for the rest
app.use(express.json())

app.get('/health', (_req, res) => res.json({ ok:true, ts: Date.now() }))

app.use('/ai', fusionRouter)
app.use('/ai', whatifRouter)
app.use('/privacy', redactionRouter)
app.use('/social', endorseRouter)
app.use('/scholarships', scholarshipsRouter)
app.use('/k12', k12Router)
app.use('/school', schoolRouter)
app.use('/gov', govRouter)
app.get('/payments/hyperpay/verify', hyperpayVerify)
app.use('/compliance/zatca', zatcaRouter)
app.use('/trust', trustRouter)

app.get('/profile/demo', (_req,res)=> res.json({ ok:true, profile:{ id:'demo', name:'Guest User', class:'N/A' } }))

const PORT = Number(process.env.PORT || 4000)
app.listen(PORT, ()=> console.log('API listening on :' + PORT))
