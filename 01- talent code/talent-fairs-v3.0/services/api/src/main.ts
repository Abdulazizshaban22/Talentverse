import express from 'express'
import http from 'http'
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()
const app = express()
const server = http.createServer(app)
app.use(express.json({ limit:'3mb' }))

// --- PDPL-aware helper (stub)
function requireConsent(purpose:string){ return async (studentId:string)=>{
  const c = await prisma.consent.findFirst({ where:{ studentId, purpose, granted:true } })
  return !!c
}}

// --- School stats (demo)
app.get('/school/stats', async (_req, res)=>{
  const schools = await prisma.school.count()
  const students = await prisma.student.count()
  const assessments = await prisma.assessment.count()
  res.json({ ok:true, schools, students, assessments, v:'3.0' })
})

// --- Create basic school assessment (creates entities on the fly for demo)
app.post('/assessments', async (req, res)=>{
  const { school, className, studentName, scores } = req.body||{}
  const sc = await prisma.school.upsert({ where:{ name: school||'Unknown School' }, update:{}, create:{ name: school||'Unknown School' } })
  const cl = await prisma.class.create({ data:{ name: className||'Grade', schoolId: sc.id } })
  const st = await prisma.student.create({ data:{ fullName: studentName||'Student', classId: cl.id } })
  const s = scores||{}
  await prisma.assessment.create({ data:{
    studentId: st.id, schoolId: sc.id, className: className||'Grade',
    linguistic: s.linguistic||3, logical: s.logical||3, social: s.social||3, art: s.art||3,
    kinesthetic: s.kinesthetic||3, spatial: s.spatial||3, digital: s.digital||3, self: s.self||3
  }})
  res.json({ ok:true, studentId: st.id, msg: 'تم حفظ التقييم' })
})

// --- Consents (list + create)
app.get('/consents', async (_req,res)=>{
  const list = await prisma.consent.findMany({ take: 100, orderBy:{ createdAt:'desc' } })
  res.json(list)
})
app.post('/consents', async (req,res)=>{
  const { studentId, purpose, grant, grantedBy } = req.body||{}
  if(!studentId || !purpose) return res.status(400).json({ ok:false, error:'missing_fields' })
  const c = await prisma.consent.create({ data:{ studentId, purpose, granted: !!grant, grantedBy: grantedBy||'guardian' } })
  res.json({ ok:true, id:c.id, msg: grant? 'Consent granted' : 'Consent revoked' })
})

// --- Life Profile (requires consent for 'guardian_view' or student relation — simplified demo)
app.get('/profile/:id', async (req,res)=>{
  const id = String(req.params.id)
  const st = await prisma.student.findUnique({ where:{ id }, include:{
    assessments:true, portfolio:true, growth:true, consents:true, class:true
  }})
  if(!st) return res.status(404).json({ ok:false, error:'not_found' })
  res.json({ ok:true, profile:{
    id: st.id, name: st.fullName, class: st.class?.name,
    snapshots: st.assessments, portfolio: st.portfolio, growth: st.growth, consents: st.consents
  } })
})

// --- AI: compute simple cognitive index from latest assessment
app.get('/growth/:id', async (req,res)=>{
  const id = String(req.params.id)
  const a = await prisma.assessment.findMany({ where:{ studentId: id }, orderBy:{ createdAt:'asc' } })
  if(!a.length) return res.json({ ok:true, series:[] })
  const series = a.map((x,i)=>{
    const sum = x.linguistic+x.logical+x.social+x.art+x.kinesthetic+x.spatial+x.digital+x.self
    const idx = sum/40  // normalize 0..1
    return { t: i, cognitive_index: Number(idx.toFixed(3)) }
  })
  res.json({ ok:true, series })
})

// --- Graph export (nodes/edges JSON for Neo4j import)
app.post('/graph/export', async (_req,res)=>{
  const students = await prisma.student.findMany({ include:{ assessments:true } })
  const nodes:any[] = []; const edges:any[] = []
  for(const st of students){
    nodes.push({ id: st.id, type:'student', name: st.fullName })
    for(const a of st.assessments){
      const aid = a.id
      nodes.push({ id: aid, type:'assessment', ts: a.createdAt })
      edges.push({ from: st.id, to: aid, type:'HAS_ASSESSMENT' })
    }
  }
  res.json({ ok:true, nodes, edges })
})

app.get('/health', (_req,res)=> res.json({ ok:true, v:'3.0' }))

server.listen(4000, ()=> console.log('API v3.0 listening on 4000'))
