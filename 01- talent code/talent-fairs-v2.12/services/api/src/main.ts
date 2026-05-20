import express from 'express'
import http from 'http'
import { PrismaClient } from '@prisma/client'
import fetch from 'node-fetch'
const prisma = new PrismaClient()
const app = express()
const server = http.createServer(app)
app.use(express.json({limit:'1mb'}))

app.get('/admin/rules', async (_req,res)=> res.json(await prisma.screeningRule.findMany()))
app.post('/admin/rules', async (req,res)=> res.json(await prisma.screeningRule.create({data:req.body})))

app.post('/screening/apply', async (req,res)=>{
  const rules = await prisma.screeningRule.findMany({ where:{ active:true } })
  const payload = req.body||{}
  for(const r of rules){
    const d = (r.dsl as any).then||{decision:'accept'}
    return res.json({ decision:d, rule:r.name })
  }
  res.json({ decision:{decision:'manual_review'} })
})

const escoBase = (process.env.ESCO_API_BASE||'https://ec.europa.eu/esco/api').replace(/\/$/,'')
app.get('/sync/esco/occupations', async (req,res)=>{
  const q = String(req.query.q||'software')
  const url = `${escoBase}/search?type=occupation&text=${encodeURIComponent(q)}&limit=5`
  const r = await fetch(url,{headers:{'Accept':'application/json'}}); const dj:any = await r.json()
  const items = (dj?._embedded?.results||[]).map((it:any)=>({name: it.title||it.label, escoId: it.uri||it.id}))
  res.json({ ok:true, items })
})

app.get('/health', (_req,res)=> res.json({ok:true, v:'2.12'}))
server.listen(4000, ()=> console.log('API v2.12 up'))


app.post('/notify/whatsapp/interactive', async (req,res)=>{
  const { to, mode, header, body, footer, sections=[], buttons=[] } = req.body||{}
  const token = process.env.WHATSAPP_TOKEN||''
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID||''
  let interactive:any
  if(mode==='list'){
    interactive = {
      type:'list',
      header:{type:'text',text:header||''},
      body:{text:body||''},
      footer:{text:footer||''},
      action:{button:'اختر',sections:(sections||[]).map((s:any)=>({title:s.title,rows:(s.rows||[]).map((r:any)=>({id:r.id,title:r.title}))}))}
    }
  }else{
    interactive = {
      type:'button',
      header:{type:'text',text:header||''},
      body:{text:body||''},
      footer:{text:footer||''},
      action:{buttons:(buttons||[]).map((b:any)=>({type:'reply',reply:{id:b.id,title:b.title}}))}
    }
  }
  const r = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
    body: JSON.stringify({ messaging_product:'whatsapp', to, type:'interactive', interactive })
  })
  const dj = await r.json().catch(()=>({}))
  res.json(dj)
})


import fs from 'fs'
import path from 'path'
const dataDir = process.env.RANK_DATA_DIR || './data/rank'
app.post('/ranker/dataset/export', async (_req,res)=>{
  const file = path.join(dataDir, 'train.jsonl')
  fs.mkdirSync(dataDir, { recursive: true })
  const rows = [
    { qid: 1, features: [0.8,0.2,0.4], label: 1 },
    { qid: 1, features: [0.6,0.1,0.2], label: 0 },
    { qid: 2, features: [0.1,0.9,0.7], label: 1 },
  ]
  fs.writeFileSync(file, rows.map(x=> JSON.stringify(x)).join('\n'), 'utf-8')
  res.json({ ok:true, file })
})
app.post('/ranker/weights/reload', async (req,res)=>{
  const { wGraph=0.5, wLTR=0.5 } = req.body||{}
  const r = await prisma.rankerWeights.upsert({ where:{ id:'singleton' }, update:{ wGraph, wLTR }, create:{ id:'singleton', wGraph, wLTR } })
  res.json({ ok:true, weights: r })
})
