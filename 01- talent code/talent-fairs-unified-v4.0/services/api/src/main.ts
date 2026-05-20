import express from 'express'
import http from 'http'
import { PrismaClient } from '@prisma/client'
import fetch from 'node-fetch'
import neo4j from 'neo4j-driver'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { create } from 'xmlbuilder2'

const prisma = new PrismaClient()
const app = express()
const server = http.createServer(app)
app.use(express.json({ limit:'8mb' }))

// ---- helpers
function parseCSV(text:string): any[] {
  const lines = (text||'').split(/\r?\n/).filter(l=>l.trim().length>0)
  if(lines.length===0) return []
  const headers = lines[0].split(',').map(h=>h.trim())
  const rows:any[] = []
  for(let i=1;i<lines.length;i++){
    const cols = lines[i].split(',')
    const obj:any = {}
    for(let j=0;j<headers.length;j++) obj[headers[j]] = (cols[j]||'').trim()
    rows.push(obj)
  }
  return rows
}

// ---- OneRoster (CSV + REST sync demo)
app.post('/oneroster/import/csv', async (req,res)=>{
  const { schools, classes, users, enrollments } = req.body||{}
  const sch = parseCSV(schools||''); const cls = parseCSV(classes||''); const usr = parseCSV(users||''); const enr = parseCSV(enrollments||'')
  const sm = new Map<string,string>()
  for(const s of sch){
    const sc = await prisma.school.upsert({ where:{ name: s.name }, update:{}, create:{ name: s.name } })
    sm.set(s.name, sc.id)
  }
  const cm = new Map<string,string>()
  for(const c of cls){
    const scId = sm.get(c.schoolSourcedId)||Array.from(sm.values())[0]
    const cl = await prisma.class.create({ data:{ title: c.title||c.name||'Class', schoolId: scId } })
    cm.set(c.sourcedId||c.title, cl.id)
  }
  const tm = new Map<string,string>()
  for(const u of usr){
    if((u.role||'').toLowerCase()==='teacher'){
      const t = await prisma.teacher.create({ data:{ sourcedId: u.sourcedId||null, givenName: u.givenName||'', familyName: u.familyName||'' } })
      tm.set(u.sourcedId||`${u.givenName}_${u.familyName}`, t.id)
    }
  }
  for(const e of enr){
    if((e.role||'').toLowerCase()==='teacher'){
      const tid = tm.get(e.userSourcedId); const cid = cm.get(e.classSourcedId)
      if(tid && cid){ await prisma.teacherClass.create({ data:{ teacherId: tid, classId: cid } }) }
    }
  }
  res.json({ ok:true, counts:{ schools: sch.length, classes: cls.length, teachers: tm.size, enrollments: enr.length } })
})

app.post('/oneroster/sync/rest', async (_req,res)=>{
  const base = process.env.ONEROSTER_API_BASE||''
  const token = process.env.ONEROSTER_TOKEN||''
  if(!base||!token) return res.status(400).json({ ok:false, error:'missing_oneroster_env' })
  try{
    const r = await fetch(base + '/orgs', { headers:{ Authorization: `Bearer ${token}` }})
    const dj:any = await r.json()
    res.json({ ok:true, sample: Array.isArray(dj)? dj.slice(0,2): dj })
  }catch(e:any){ res.status(500).json({ ok:false, error:String(e) }) }
})

// ---- Teachers list
app.get('/teachers', async (_req,res)=>{ const list = await prisma.teacher.findMany({ include:{ classes:true } }); res.json(list) })

// ---- Schedule terms
app.post('/schedule/terms', async (req,res)=>{
  const title = String(req.body?.title||'Term')
  const dueDate = new Date(String(req.body?.dueDate||new Date().toISOString().slice(0,10)))
  const t = await prisma.term.create({ data:{ title, dueDate } })
  res.json({ ok:true, id:t.id, due:t.dueDate })
})

// ---- Neo4j GDS (ingest + pagerank)
const NEO4J_URI = process.env.NEO4J_URI||''
const NEO4J_USER = process.env.NEO4J_USER||''
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD||''
app.post('/gds/ingest', async (_req,res)=>{
  if(!NEO4J_URI) return res.status(400).json({ ok:false, error:'neo4j_env_missing' })
  const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)); const session = driver.session()
  try {
    const students = await prisma.student.findMany({ include:{ class:true }})
    await session.run('MATCH (n) DETACH DELETE n') // demo reset
    for(const st of students){
      await session.run('MERGE (s:Student {id:$id}) SET s.name=$name', { id: st.id, name: st.fullName })
      if(st.classId){
        await session.run('MERGE (c:Class {id:$cid}) SET c.name=$cname', { cid: st.classId, cname: st.class?.title||'Class' })
        await session.run('MATCH (s:Student {id:$sid}),(c:Class {id:$cid}) MERGE (s)-[:IN]->(c)', { sid: st.id, cid: st.classId })
      }
    }
    await session.close(); await driver.close()
    res.json({ ok:true, students: students.length })
  } catch(e:any){
    try{ await session.close(); await driver.close() }catch{}
    res.status(500).json({ ok:false, error:String(e) })
  }
})
app.post('/gds/pagerank', async (_req,res)=>{
  if(!NEO4J_URI) return res.status(400).json({ ok:false, error:'neo4j_env_missing' })
  const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)); const session = driver.session()
  try {
    await session.run('CALL gds.graph.project($g, ["Student","Class"], {IN:{type:"IN", orientation:"NATURAL"}})', { g: 'tf_school' })
    const result = await session.run('CALL gds.pageRank.stream($g) YIELD nodeId, score, nodeLabels WITH nodeId, score, nodeLabels WHERE "Student" IN nodeLabels RETURN gds.util.asNode(nodeId).id AS id, score ORDER BY score DESC LIMIT 50', { g: 'tf_school' })
    const rows = result.records.map(r=> ({ id: r.get('id'), score: r.get('score') }))
    for(const r of rows){ await prisma.graphScore.create({ data:{ studentId: r.id, score: r.score } }) }
    await session.run('CALL gds.graph.drop($g)', { g: 'tf_school' })
    await session.close(); await driver.close()
    res.json({ ok:true, top: rows })
  } catch(e:any){
    try{ await session.close(); await driver.close() }catch{}
    res.status(500).json({ ok:false, error:String(e), hint:'Ensure Neo4j GDS is installed and credentials are correct.' })
  }
})

// ---- Explain-Why UI stubs + PDF (Playwright)
app.get('/explain/shap/summary', (_req,res)=> res.json({ ok:true, plot:'summary', topFeatures:[{name:'skill_match',impact:0.43},{name:'experience',impact:0.29}] }))
app.get('/explain/shap/force', (_req,res)=> res.json({ ok:true, plot:'force', contributions:[+0.21,-0.11,+0.07] }))
app.post('/export/pdf', async (_req,res)=>{
  const { chromium } = await import('playwright')
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setContent(`<html><body><h1>Explain Report</h1><p>SHAP summary/force snapshots.</p></body></html>`)
  const pdf = await page.pdf({ format:'A4' })
  await browser.close()
  res.setHeader('Content-Type','application/pdf'); res.send(pdf)
})

// ---- ESCO + Europass + HR-Open
app.get('/esco/search', async (req,res)=>{
  const q = String(req.query.q||'software')
  const base = process.env.ESCO_API||'https://ec.europa.eu/esco/api'
  const url = `${base}/search?language=en&q=${encodeURIComponent(q)}&type=skill`
  const r = await fetch(url); const dj = await r.json()
  res.json({ ok:true, total: dj.total, items: dj._embedded?.results?.slice(0,10)||[] })
})
app.post('/europass/export', async (req,res)=>{
  const cv = req.body||{}
  const doc = create({ version:'1.0', encoding:'UTF-8' })
    .ele('Europass', { 'xsi:noNamespaceSchemaLocation':'europass-xml-schema-v3.xsd', xmlns:'http://europass.cedefop.europa.eu/Europass', 'xmlns:xsi':'http://www.w3.org/2001/XMLSchema-instance' })
      .ele('DocumentInformation').ele('DocumentType').txt('ECV').up().up()
      .ele('Identification').ele('PersonName')
        .ele('FirstName').txt(cv.firstName||'').up()
        .ele('Surname').txt(cv.lastName||'').up()
      .up().up()
      .ele('WorkExperience').ele('Employer').txt(cv.employer||'').up().up()
    .up()
  const xml = doc.end({ prettyPrint:true })
  res.setHeader('Content-Type','application/xml'); res.send(xml)
})
app.post('/hropen/position', async (req,res)=>{
  const p = req.body||{ title:'Software Engineer' }
  const doc = create({ version:'1.0', encoding:'UTF-8' })
    .ele('PositionOpening', { xmlns:'http://www.hr-xml.org/3' })
      .ele('PositionTitle').txt(p.title).up()
      .ele('OrganizationName').txt(p.org||'Org').up()
    .up()
  const xml = doc.end({ prettyPrint:true })
  res.setHeader('Content-Type','application/xml'); res.send(xml)
})

// ---- Keycloak-protected areas (realm roles)
const JWKS_URL = process.env.OIDC_JWKS||''
const ISSUER = process.env.OIDC_ISSUER||''
const CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID||''
async function auth(req:any,res:any,next:any){
  try{
    const hdr = String(req.headers.authorization||'')
    if(!hdr.startsWith('Bearer ')) return res.status(401).json({ok:false,error:'no_token'})
    const token = hdr.slice(7)
    const JWKS = createRemoteJWKSet(new URL(JWKS_URL))
    const { payload } = await jwtVerify(token, JWKS, { issuer: ISSUER, audience: CLIENT_ID })
    req.user = payload; next()
  }catch(e:any){ res.status(401).json({ ok:false, error:'invalid_token', detail:String(e) }) }
}
function hasRole(role:string){
  return (req:any,res:any,next:any)=>{
    const roles = (((req.user||{})['realm_access']||{})['roles']||[]) as string[]
    if(roles && roles.includes(role)) return next()
    return res.status(403).json({ ok:false, error:'forbidden', need: role })
  }
}
app.get('/teacher/area', auth, hasRole('Teacher'), (_req,res)=> res.json({ ok:true, area:'teacher' }))
app.get('/guardian/area', auth, hasRole('Guardian'), (_req,res)=> res.json({ ok:true, area:'guardian' }))
app.get('/admin/area', auth, hasRole('Admin'), (_req,res)=> res.json({ ok:true, area:'admin' }))

// ---- Consents + Profile (basic reused)
app.post('/consents', async (req,res)=>{
  const { studentId, purpose, grant, grantedBy } = req.body||{}
  if(!studentId || !purpose) return res.status(400).json({ ok:false, error:'missing_fields' })
  const c = await prisma.consent.create({ data:{ studentId, purpose, granted: !!grant, grantedBy: grantedBy||'guardian' } })
  res.json({ ok:true, id:c.id, msg: grant? 'Consent granted' : 'Consent revoked' })
})
app.get('/profile/:id', async (req,res)=>{
  const id = String(req.params.id)
  const st = await prisma.student.findUnique({ where:{ id }, include:{ class:true } })
  if(!st) return res.status(404).json({ ok:false, error:'not_found' })
  res.json({ ok:true, profile:{ id: st.id, name: st.fullName, class: st.class?.title } })
})

app.get('/health', (_req,res)=> res.json({ ok:true, v:'4.0' }))

server.listen(4000, ()=> console.log('API unified v4.0 listening on 4000'))
