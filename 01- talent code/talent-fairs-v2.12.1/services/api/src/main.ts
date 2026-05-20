import express from 'express'
import http from 'http'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()
const app = express()
const server = http.createServer(app)
app.use(express.json({ limit:'2mb' }))

// ---- Templates ----
const templates: any = {
  "tech_base": {
    "name": "Tech — Base Screening",
    "sector": "Technology",
    "description": "يشترط مهارات تقنية أساسية وخبرة 2+ سنوات، مع تفضيل خبرة React/Node وRemote-friendly",
    "dsl": {
      "if": [
        {
          "skills_overlap_at_least": 4
        },
        {
          "experience_years_at_least": 2
        },
        {
          "must_include_keywords": [
            "react",
            "node"
          ]
        }
      ],
      "then": {
        "decision": "accept",
        "points": 30
      },
      "else": {
        "decision": "manual_review",
        "points": 10
      }
    }
  },
  "retail_ops": {
    "name": "Retail — Store Ops",
    "sector": "Retail",
    "description": "خدمة عملاء + مناوبات + تواجد محلي، مع مفاضلة لحاملي شهادات POS/Inventory",
    "dsl": {
      "if": [
        {
          "skills_overlap_at_least": 3
        },
        {
          "must_include_keywords": [
            "customer service",
            "pos"
          ]
        },
        {
          "location_in": [
            "riyadh",
            "jeddah",
            "khobar"
          ]
        }
      ],
      "then": {
        "decision": "accept",
        "points": 20
      },
      "else": {
        "decision": "manual_review",
        "points": 5
      }
    }
  },
  "logistics_dispatch": {
    "name": "Logistics — Dispatch & Fleet",
    "sector": "Logistics",
    "description": "خبرة في التوزيع/الأسطول مع مهارات تتبع وشهادات سلامة؛ تفضيل رخصة قيادة سارية",
    "dsl": {
      "if": [
        {
          "skills_overlap_at_least": 3
        },
        {
          "experience_years_at_least": 1
        },
        {
          "must_include_keywords": [
            "fleet",
            "dispatch",
            "safety"
          ]
        }
      ],
      "then": {
        "decision": "accept",
        "points": 18
      },
      "else": {
        "decision": "manual_review",
        "points": 6
      }
    }
  }
}

app.get('/admin/rules/templates', async (_req,res)=>{
  const list = Object.entries(templates).map(([key, v]: any)=> ({ key, ...(v as any) }))
  res.json(list as any)
})

app.post('/admin/rules/templates/install', async (req,res)=>{
  const key = String((req.body||{}).key||'')
  const tpl = (templates as any)[key]
  if(!tpl) return res.status(404).json({ ok:false, error:'template_not_found' })
  await prisma.screeningRule.create({ data:{ name: tpl.name, sector: tpl.sector, dsl: tpl.dsl } })
  res.json({ ok:true, installed: key })
})

// ---- CSV → JSONL ingest ----
function parseCSV(text:string): any[] {
  const lines = text.split(/\r?\n/).filter(l=>l.trim().length>0)
  if(lines.length===0) return []
  const headers = lines[0].split(',').map(h=>h.trim())
  const rows = []
  for(let i=1;i<lines.length;i++) {
    const cols = lines[i].split(',')
    const obj:any = {}
    for(let j=0;j<headers.length;j++) obj[headers[j]] = (cols[j]||'').trim()
    rows.push(obj)
  }
  return rows
}

app.post('/ranker/dataset/ingest', async (req,res)=>{
  const csv = String((req.body||{}).csv||'')
  if(!csv) return res.status(400).json({ ok:false, error:'no_csv' })
  const rows = parseCSV(csv)
  if(rows.length===0) return res.status(400).json({ ok:false, error:'empty_rows' })

  const outDir = path.join(process.cwd(), 'data', 'rank')
  fs.mkdirSync(outDir, { recursive: true })
  const stamp = new Date().toISOString().replace(/[:.]/g,'-')
  const outFile = path.join(outDir, `upload_{stamp}.jsonl`)

  // Expect headers: qid,label,f1,f2,...
  const jsonl = rows.map(r=> JSON.stringify({
    qid: Number(r.qid),
    label: Number(r.label),
    features: Object.keys(r).filter(k=>/^f\d+$/i.test(k)).map(k=> Number(r[k]))
  })).join('\n')

  fs.writeFileSync(outFile, jsonl, 'utf-8')
  res.json({ ok:true, file: outFile, count: rows.length })
})

app.post('/ranker/dataset/clear', async (_req,res)=>{
  const outDir = path.join(process.cwd(), 'data', 'rank')
  try { fs.rmSync(outDir, { recursive: true, force: true }) } catch(e) { /* ignore */ }
  res.json({ ok:true })
})

app.get('/health', (_req,res)=> res.json({ ok:true, v:'2.12.1' }))

server.listen(4000, ()=> console.log('API v2.12.1 listening on 4000'))
