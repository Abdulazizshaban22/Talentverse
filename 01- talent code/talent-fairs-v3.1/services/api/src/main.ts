import express from 'express'
import http from 'http'
import { PrismaClient } from '@prisma/client'
import neo4j from 'neo4j-driver'

const prisma = new PrismaClient()
const app = express()
const server = http.createServer(app)
app.use(express.json({ limit:'6mb' }))

const NEO4J_URI = process.env.NEO4J_URI||''
const NEO4J_USER = process.env.NEO4J_USER||''
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD||''

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

// --- SIS: OneRoster-like import (simplified)
app.post('/sis/oneroster/import', async (req,res)=>{
  const { schoolsCsv, classesCsv, studentsCsv, enrollmentsCsv } = req.body||{}
  const schools = parseCSV(schoolsCsv||'')
  const classes = parseCSV(classesCsv||'')
  const students = parseCSV(studentsCsv||'')
  const enrolls = parseCSV(enrollmentsCsv||'')

  const schoolMap = new Map<string,string>()
  for(const s of schools){
    const sc = await prisma.school.upsert({ where:{ name: s.name }, update:{}, create:{ name: s.name } })
    schoolMap.set(s.name, sc.id)
  }
  const classMap = new Map<string,string>()
  for(const c of classes){
    const sid = schoolMap.get(c.school)||null
    const cl = await prisma.class.create({ data:{ name: c.name, schoolId: sid! } })
    classMap.set(c.name, cl.id)
  }
  const studentMap = new Map<string,string>()
  for(const st of students){
    const cid = classMap.get(st['class'])||null
    const s = await prisma.student.create({ data:{ fullName: st.fullName, classId: cid! } })
    studentMap.set(st.fullName, s.id)
  }
  // enrollments are informational in this simplified flow
  res.json({ ok:true, counts:{ schools: schools.length, classes: classes.length, students: students.length, enrollments: enrolls.length } })
})

// --- GDS: Ingest (students + classes, edges STUDENT_IN_CLASS)
app.post('/gds/ingest', async (_req,res)=>{
  if(!NEO4J_URI) return res.status(400).json({ ok:false, error:'neo4j_env_missing' })
  const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD))
  const session = driver.session()
  try {
    const students = await prisma.student.findMany({ include:{ class:true }})
    await session.run('MATCH (n) DETACH DELETE n') // demo reset
    for(const st of students){
      await session.run('MERGE (s:Student {id:$id}) SET s.name=$name', { id: st.id, name: st.fullName })
      if(st.classId){
        await session.run('MERGE (c:Class {id:$cid}) SET c.name=$cname', { cid: st.classId, cname: st.class?.name||'Class' })
        await session.run('MATCH (s:Student {id:$sid}),(c:Class {id:$cid}) MERGE (s)-[:IN]->(c)', { sid: st.id, cid: st.classId })
      }
    }
    await session.close(); await driver.close()
    res.json({ ok:true, students: students.length, info:'ingested to neo4j (demo reset + merge)' })
  } catch(e:any){
    try{ await session.close(); await driver.close() }catch{}
    res.status(500).json({ ok:false, error:String(e) })
  }
})

// --- GDS: PageRank (transient projection) and save back to DB
app.post('/gds/pagerank', async (_req,res)=>{
  if(!NEO4J_URI) return res.status(400).json({ ok:false, error:'neo4j_env_missing' })
  const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD))
  const session = driver.session()
  try {
    // Project graph
    await session.run('CALL gds.graph.project($g, ["Student","Class"], {IN:{type:"IN", orientation:"NATURAL"}})', { g: 'tf_school' })
    // Run PageRank on Students only (filter by label)
    const result = await session.run('CALL gds.pageRank.stream($g) YIELD nodeId, score, nodeLabels WITH nodeId, score, nodeLabels WHERE "Student" IN nodeLabels RETURN gds.util.asNode(nodeId).id AS id, score ORDER BY score DESC LIMIT 50', { g: 'tf_school' })
    const rows = result.records.map(r=> ({ id: r.get('id'), score: r.get('score') }))
    // Save back to DB
    for(const r of rows){
      await prisma.graphScore.create({ data:{ studentId: r.id, score: r.score } })
    }
    await session.run('CALL gds.graph.drop($g)', { g: 'tf_school' })
    await session.close(); await driver.close()
    res.json({ ok:true, top: rows })
  } catch(e:any){
    try{ await session.close(); await driver.close() }catch{}
    res.status(500).json({ ok:false, error:String(e), hint:'Ensure Neo4j GDS is installed and credentials are correct.' })
  }
})

// --- Health
app.get('/health', (_req,res)=> res.json({ ok:true, v:'3.1' }))

server.listen(4000, ()=> console.log('API v3.1 listening on 4000'))
