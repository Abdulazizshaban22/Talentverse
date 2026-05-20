import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { router as privacy } from './privacy_redact.js'
import { router as loyalty } from './loyalty_points.js'
import { router as edutwin } from './edutwin_analytics.js'
import { zatcaSignHandler } from './compliance_zatca_pkcs11js.js'

const app = express()
app.use(cors())
app.use(bodyParser.json({limit: '2mb'}))

// Tenant middleware (subdomain → tenantId) — simplified
app.use((req, _res, next)=>{
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '')
  const parts = host.split('.')
  req.tenantId = (parts.length > 2) ? parts[0].toLowerCase() : 'public'
  next()
})

// Health
app.get('/health', (_req, res)=> res.json({ok:true, service:'talentfairs-api', ts: Date.now()}))

// AI What-If (demo fusion of LTR + Graph scores)
app.post('/ai/whatif', (req, res)=>{
  const { ltr_weight=0.6, graph_weight=0.4, sample=[] } = req.body || {}
  const out = sample.map(s=>{
    const l = Number(s.ltr||0), g = Number(s.graph||0)
    return { id: s.id, ltr:l, graph:g, score: (ltr_weight*l) + (graph_weight*g) }
  }).sort((a,b)=>b.score-a.score)
  res.json({ ok:true, results: out })
})

// Privacy/Redaction
app.use('/privacy', privacy)

// Loyalty
app.use('/loyalty', loyalty)

// EduTwin
app.use('/edutwin', edutwin)

// ZATCA PKCS#11 signing endpoint (stub for HSM)
app.post('/compliance/zatca/sign', zatcaSignHandler)

const PORT = process.env.PORT || 4000
app.listen(PORT, ()=>{
  console.log(`TalentFairs API running on http://localhost:${PORT}`)
})
