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

// --- Admin: Jobs ---
app.get('/admin/jobs', async (_req,res)=>{
  const rows = await prisma.job.findMany({ orderBy:{ createdAt:'desc' } })
  res.json(rows)
})
app.post('/admin/jobs', async (req,res)=>{
  const { title, company, description, employmentType, location, applyUrl } = req.body||{}
  const j = await prisma.job.create({ data:{ title, company, description, employmentType, location, applyUrl } })
  await prisma.auditLog.create({ data:{ actorId:'admin', action:'job.create', data:{ id:j.id } } })
  res.json(j)
})
app.delete('/admin/jobs/:id', async (req,res)=>{
  await prisma.job.delete({ where:{ id: String(req.params.id) } })
  res.json({ ok:true })
})

// --- Admin: Challenges ---
app.get('/admin/challenges', async (_req,res)=>{
  const rows = await prisma.challenge.findMany({ orderBy:{ createdAt:'desc' } })
  res.json(rows)
})
app.post('/admin/challenges', async (req,res)=>{
  const { title, description, points=50 } = req.body||{}
  const c = await prisma.challenge.create({ data:{ title, description, points } })
  await prisma.auditLog.create({ data:{ actorId:'admin', action:'challenge.create', data:{ id:c.id } } })
  res.json(c)
})
app.delete('/admin/challenges/:id', async (req,res)=>{
  await prisma.challenge.delete({ where:{ id: String(req.params.id) } })
  res.json({ ok:true })
})

// --- Export: Europass JSON (basic mapping) ---
function europassFromProfile(p:any){
  return {
    '@context': 'https://europass.europa.eu/schemas/edc-v1.jsonld',
    type: 'EuropassCV',
    person: {
      fullName: p.fullName || '',
      headline: p.headline || '',
      summary: p.summary || '',
      location: p.location || ''
    },
    experience: (p.experience||[]).map((e:any)=> ({ company: e.company, title: e.title, startDate: e.startDate, endDate: e.endDate, summary: e.summary })),
    education: (p.education||[]).map((e:any)=> ({ school: e.school, degree: e.degree, field: e.field, startDate: e.startDate, endDate: e.endDate })),
    skills: (p.skills||[]).map((s:any)=> s.skill?.name).filter(Boolean)
  }
}

app.get('/export/europass/:userId', async (req,res)=>{
  const userId = String(req.params.userId)
  const prof = await prisma.profile.findFirst({ where:{ userId }, include:{ skills:{ include:{ skill:true } }, experience:true, education:true } })
  if(!prof) return res.status(404).json({ ok:false })
  const doc = europassFromProfile(prof)
  res.json(doc)
})

// --- Export: HR-XML (Resume.xsd subset) ---
function hrxmlFromProfile(p:any){
  const root = create({ version:'1.0', encoding:'UTF-8' })
    .ele('Resume', { xmlns: 'http://ns.hr-xml.org/2007-04-15' })
      .ele('StructuredXMLResume')
        .ele('ContactInfo')
          .ele('PersonName').ele('FormattedName').txt(p.fullName||'').up().up()
          .ele('ContactMethod').ele('Location').ele('PostalAddress').ele('CountryCode').txt('SA').up().up().up().up().up()
        .ele('EmploymentHistory')
  for(const e of (p.experience||[])){
    root.ele('EmployerOrg').ele('EmployerOrgName').txt(e.company||'').up()
      .ele('PositionHistory').ele('Title').txt(e.title||'').up().up()
  }
  root.up().ele('EducationHistory')
  for(const e of (p.education||[])){
    root.ele('SchoolOrInstitution').ele('School').ele('SchoolName').txt(e.school||'').up().up()
      .ele('Degree').ele('DegreeName').txt(e.degree||'').up().up()
  }
  root.up().up()
  return root.end({ prettyPrint:true })
}

app.get('/export/hrxml/:userId', async (req,res)=>{
  const userId = String(req.params.userId)
  const prof = await prisma.profile.findFirst({ where:{ userId }, include:{ skills:{ include:{ skill:true } }, experience:true, education:true } })
  if(!prof) return res.status(404).json({ ok:false })
  const xml = hrxmlFromProfile(prof)
  res.setHeader('Content-Type','application/xml; charset=utf-8')
  res.send(xml)
})

// --- Notifications: Resend (Email) ---
app.post('/notify/email', async (req,res)=>{
  const { to, subject='Talent Fairs', html='<p>Hello</p>' } = req.body||{}
  const key = process.env.RESEND_API_KEY||''
  const r = await fetch('https://api.resend.com/emails', { method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization': 'Bearer '+key }, body: JSON.stringify({ from:'Talent Fairs <noreply@talentfairs.dev>', to:[to], subject, html }) })
  const dj = await r.json().catch(()=>({}))
  await prisma.auditLog.create({ data:{ actorId:'system', action:'resend.email', data:dj } })
  res.json(dj)
})

// --- Notifications: WhatsApp Cloud API ---
// Send message
app.post('/notify/whatsapp', async (req,res)=>{
  const { to, text } = req.body||{}
  const token = process.env.WHATSAPP_TOKEN||''
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID||''
  const r = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
    method:'POST',
    headers:{ 'Content-Type':'application/json', 'Authorization': 'Bearer '+token },
    body: JSON.stringify({ messaging_product:'whatsapp', to, type:'text', text:{ body:text } })
  })
  const dj = await r.json().catch(()=>({}))
  await prisma.auditLog.create({ data:{ actorId:'system', action:'wa.send', data:dj } })
  res.json(dj)
})

// Verify webhook
app.get('/webhooks/whatsapp', (req,res)=>{
  const mode = String(req.query['hub.mode']||'')
  const token = String(req.query['hub.verify_token']||'')
  const challenge = String(req.query['hub.challenge']||'')
  if(mode==='subscribe' && token === (process.env.WHATSAPP_VERIFY_TOKEN||'')){
    return res.status(200).send(challenge)
  }
  return res.sendStatus(403)
})

// Receive webhook
app.post('/webhooks/whatsapp', async (req,res)=>{
  await prisma.auditLog.create({ data:{ actorId:'system', action:'wa.webhook', data:req.body } })
  res.json({ ok:true })
})

app.get('/health', (_req,res)=> res.json({ ok:true, v:'2.10' }))

server.listen(port, ()=> console.log('API v2.10 listening on', port))
