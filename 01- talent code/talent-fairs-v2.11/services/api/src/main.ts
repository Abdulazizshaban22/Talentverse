import express from 'express'
import http from 'http'
import { PrismaClient } from '@prisma/client'
import fetch from 'node-fetch'
import client from 'prom-client'
import * as jose from 'jose'
import { create } from 'xmlbuilder2'

const prisma = new PrismaClient()
const app = express()
const server = http.createServer(app)

const port = Number(process.env.PORT_API||4000)
const issuer = process.env.KEYCLOAK_ISSUER||''
const jwksUrl = process.env.KEYCLOAK_JWKS_URL||''
const audience = process.env.KEYCLOAK_AUDIENCE||'web'
const escoBase = (process.env.ESCO_API_BASE||'https://ec.europa.eu/esco/api').replace(/\/$/,'')

app.use(express.json({ limit: '2mb' }))
app.use(require('express-prom-bundle')({ includeMethod: true, includePath: true }))

// ---- Prometheus custom metrics ----
const register = new client.Registry()
client.collectDefaultMetrics({ register })
app.get('/metrics', async (_req,res)=>{
  res.setHeader('Content-Type', register.contentType)
  res.end(await register.metrics())
})

// ---- JWT verifier (Keycloak) ----
const jwks = jose.createRemoteJWKSet(new URL(jwksUrl))
async function verifyToken(bearer?: string){
  if(!bearer) throw new Error('no_token')
  const token = bearer.replace(/^Bearer\s+/i,'')
  const { payload } = await jose.jwtVerify(token, jwks, { issuer, audience })
  return payload as any
}

// --- Admin: Applicants & Screening ---
app.get('/admin/applicants', async (_req,res)=>{
  const rows = await prisma.jobApplication.findMany({ orderBy:{ createdAt:'desc' }, include:{ user:true, job:true, review:true } })
  res.json(rows)
})
app.post('/admin/applicants/:id/status', async (req,res)=>{
  const id = String(req.params.id); const { status } = req.body||{}
  await prisma.jobApplication.update({ where:{ id }, data:{ status } })
  res.json({ ok:true })
})
app.post('/admin/applicants/:id/review', async (req,res)=>{
  const id = String(req.params.id); const { skills=0, experience=0, culture=0, notes='' } = req.body||{}
  const r = await prisma.applicantReview.upsert({
    where:{ applicationId: id },
    update:{ skills, experience, culture, notes },
    create:{ applicationId: id, skills, experience, culture, notes }
  })
  res.json(r)
})

// --- ESCO sync (demo: pull a few skills by query) ---
app.get('/sync/esco/skills', async (req,res)=>{
  const q = String(req.query.q||'software')
  const url = `${escoBase}/search?type=skill&text=${encodeURIComponent(q)}&limit=20`
  try{
    const r = await fetch(url,{headers:{'Accept':'application/json'}})
    const dj:any = await r.json()
    const out:any[] = []
    for(const it of (dj?._embedded?.results||[])){
      const preferredLabel = it?.title || it?.preferredLabel || it?.label || ''
      const id = it?.uri || it?.id || ''
      if(!preferredLabel || !id) continue
      const name = String(preferredLabel).trim()
      const escoId = String(id).trim()
      try{
        const s = await prisma.skill.upsert({ where:{ name }, update:{ escoId }, create:{ name, escoId, kind:'esco' } })
        out.push({ id:s.id, name:s.name, escoId:s.escoId })
      }catch(e){ /* ignore duplicates */ }
    }
    res.json({ ok:true, count: out.length, items: out })
  }catch(e){
    res.status(500).json({ ok:false, error: 'ESCO fetch failed', detail: String(e) })
  }
})

// --- LTR tuning ---
app.get('/ranker/weights', async (_req,res)=>{
  const row = await prisma.rankerWeights.findUnique({ where:{ id:'singleton' } })
  res.json(row || { wGraph:Number(process.env.COMBINE_W_GRAPH||0.5), wLTR:Number(process.env.COMBINE_W_LTR||0.5) })
})
app.post('/ranker/weights', async (req,res)=>{
  const { wGraph=0.5, wLTR=0.5 } = req.body||{}
  const r = await prisma.rankerWeights.upsert({ where:{ id:'singleton' }, update:{ wGraph, wLTR }, create:{ id:'singleton', wGraph, wLTR } })
  res.json(r)
})
app.post('/ranker/train', async (_req,res)=>{
  // Placeholder for LambdaMART training pipeline (LightGBM) — integrate in AI service
  await prisma.rankerWeights.update({ where:{ id:'singleton' }, data:{ wGraph:0.45, wLTR:0.55 } }).catch(async ()=>{
    await prisma.rankerWeights.create({ data:{ id:'singleton', wGraph:0.45, wLTR:0.55 } })
  })
  res.json({ ok:true, msg:'Training simulated: weights nudged to (0.45, 0.55)' })
})

// --- WhatsApp multi‑lang templates ---
app.post('/notify/whatsapp/template', async (req,res)=>{
  const { to, template, language_code='en' } = req.body||{}
  const token = process.env.WHATSAPP_TOKEN||''
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID||''
  const r = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
    method:'POST',
    headers:{ 'Content-Type':'application/json', 'Authorization': 'Bearer '+token },
    body: JSON.stringify({
      messaging_product:'whatsapp',
      to,
      type:'template',
      template:{ name: template, language: { code: language_code } }
    })
  })
  const dj = await r.json().catch(()=>({}))
  res.json(dj)
})

app.get('/health', (_req,res)=> res.json({ ok:true, v:'2.11' }))

server.listen(port, ()=> console.log('API v2.11 listening on', port))
