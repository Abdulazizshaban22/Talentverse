import express from 'express'
import http from 'http'
import { PrismaClient } from '@prisma/client'
import fetch from 'node-fetch'

const prisma = new PrismaClient()
const app = express()
const server = http.createServer(app)
app.use(express.json({ limit:'6mb' }))

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

// OneRoster CSV import (simplified)
app.post('/oneroster/import/csv', async (req,res)=>{
  const { schools, classes, users, enrollments } = req.body||{}
  const sch = parseCSV(schools||'')
  const cls = parseCSV(classes||'')
  const usr = parseCSV(users||'')
  const enr = parseCSV(enrollments||'')
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

// OneRoster REST sync (very simplified demo)
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

// Teachers list
app.get('/teachers', async (_req,res)=>{
  const list = await prisma.teacher.findMany({ include:{ classes:true } })
  res.json(list)
})

// Scheduling terms
app.post('/schedule/terms', async (req,res)=>{
  const title = String(req.body?.title||'Term')
  const dueDate = new Date(String(req.body?.dueDate||new Date().toISOString().slice(0,10)))
  const t = await prisma.term.create({ data:{ title, dueDate } })
  res.json({ ok:true, id:t.id, due:t.dueDate })
})

app.get('/health', (_req,res)=> res.json({ ok:true, v:'3.2' }))

server.listen(4000, ()=> console.log('API v3.2 listening on 4000'))
