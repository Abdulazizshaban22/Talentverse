import express from 'express'
import http from 'http'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()
const app = express()
const server = http.createServer(app)
app.use(express.json({ limit:'3mb' }))

// Rule Packs
const rulePacks:any = {
  "healthcare_advanced": {
    "name": "Healthcare — Advanced (Radiology/NICU)",
    "sector": "Healthcare",
    "description": "خبرة أجهزة تصوير/NICU + EMR + تواجد محلي + شهادات ACLS/PALS (مفضلة)",
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
            "radiology",
            "nicu",
            "emr"
          ]
        },
        {
          "location_in": [
            "riyadh",
            "jeddah",
            "dammam",
            "khobar"
          ]
        }
      ],
      "then": {
        "decision": "accept",
        "points": 34
      },
      "else": {
        "decision": "manual_review",
        "points": 10
      }
    }
  },
  "fintech_payments_ops": {
    "name": "FinTech — Payments Ops",
    "sector": "FinTech",
    "description": "بوابات دفع/تسويات + نزاهة معاملات + تقارير امتثال + خبرة PSP/MADA",
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
            "payments",
            "reconciliation",
            "psp",
            "mada"
          ]
        }
      ],
      "then": {
        "decision": "accept",
        "points": 26
      },
      "else": {
        "decision": "manual_review",
        "points": 8
      }
    }
  },
  "construction_bim_mgr_qs": {
    "name": "Construction — BIM Manager / QS",
    "sector": "Construction",
    "description": "BIM/Revit + تضارب الكميات/التكاليف (QS) + سلامة موقع + خبرة تقارير",
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
            "bim",
            "revit",
            "quantity",
            "safety"
          ]
        }
      ],
      "then": {
        "decision": "accept",
        "points": 29
      },
      "else": {
        "decision": "manual_review",
        "points": 9
      }
    }
  }
}
app.get('/admin/rules/packs', async (_req,res)=>{
  const list = Object.entries(rulePacks).map(([key,v]: any)=> ({ key, ...(v as any) }))
  res.json(list as any)
})
app.post('/admin/rules/packs/install', async (req,res)=>{
  const key = String((req.body||{}).key||'')
  const tpl = (rulePacks as any)[key]
  if(!tpl) return res.status(404).json({ ok:false, error:'template_not_found' })
  await prisma.screeningRule.create({ data:{ name: tpl.name, sector: tpl.sector, dsl: tpl.dsl } })
  res.json({ ok:true, installed: key })
})

// Explain (SHAP) — try python; else placeholder
app.post('/explain/ltr/shap', async (req,res)=>{
  const features:number[] = (req.body?.features||[]).map((x:any)=> Number(x))
  const modelPath = path.join(process.cwd(), 'models', 'ranker', 'model.txt')
  const py = path.join(process.cwd(), 'services', 'ai-explain', 'explain_ltr.py')
  try {
    const { spawnSync } = await import('node:child_process')
    const inp = JSON.stringify({ features, modelPath })
    const r = spawnSync('python', [py], { input: inp, encoding:'utf-8' })
    if(r.status===0 && r.stdout) return res.type('json').send(r.stdout)
  } catch(_e) {}
  const s = features.map(v=> Math.abs(Number(v)||0))
  const denom = s.reduce((a,b)=> a+b, 0) || 1
  const shap = s.map(v=> v/denom)
  return res.json({ ok:true, note:'placeholder (install python+lightgbm+shap)', shap, features })
})

// Fusion Auto‑Tune
function parseCSV(text:string): any[] {
  const lines = text.split(/\r?\n/).filter(l=>l.trim().length>0)
  if(lines.length===0) return []
  const headers = lines[0].split(',').map(h=>h.trim())
  const rows:any[] = []
  for(let i=1;i<lines.length;i++) {
    const cols = lines[i].split(',')
    const obj:any={}
    for(let j=0;j<headers.length;j++) obj[headers[j]] = (cols[j]||'').trim()
    rows.push(obj)
  }
  return rows
}
function lg(x:number){ return Math.log2(x+1) }
function ndcgAtK(items:any[], k:number): number {
  const top = items.slice(0, k)
  const dcg = top.reduce((acc,it,idx)=> acc + ((Math.pow(2, Number(it.label)) - 1) / lg(idx+2)), 0)
  const ideal = [...items].sort((a,b)=> Number(b.label) - Number(a.label)).slice(0,k)
  const idcg = ideal.reduce((acc,it,idx)=> acc + ((Math.pow(2, Number(it.label)) - 1) / lg(idx+2)), 0)
  return idcg===0? 0 : dcg/idcg
}
app.post('/ranker/fusion/autotune', async (req,res)=>{
  const csv = String(req.body?.csv||'')
  if(!csv) return res.status(400).json({ ok:false, error:'no_csv' })
  const rows = parseCSV(csv)
  if(rows.length===0) return res.status(400).json({ ok:false, error:'empty_rows' })
  const groups: Record<string, any[]> = {}
  for(const r of rows){
    const q = String(r.qid)
    const label = Number(r.label||0)
    const sg = Number(r.s_graph||0)
    const sl = Number(r.s_ltr||0)
    ;(groups[q] ||= []).push({ label, sg, sl })
  }
  let bestAlpha=0, bestN= -1
  const scan = []
  for(let a=0; a<=100; a+=5){
    const alpha = a/100
    let sum=0, cnt=0
    for(const q in groups){
      const items = groups[q].map(it=>({ label: it.label, score: alpha*it.sg + (1-alpha)*it.sl })).sort((x,y)=> y.score - x.score)
      sum += ndcgAtK(items, 5); cnt += 1
    }
    const avg = cnt? sum/cnt : 0
    scan.push({ alpha, ndcg5: avg })
    if(avg>bestN) { bestN = avg; bestAlpha = alpha }
  }
  const r = await prisma.rankerWeights.upsert({ where:{ id:'singleton' }, update:{ wGraph: bestAlpha, wLTR: 1-bestAlpha }, create:{ id:'singleton', wGraph: bestAlpha, wLTR: 1-bestAlpha } })
  res.json({ ok:true, bestAlpha, bestNDCG5: bestN, weights:r, scan })
})

app.get('/health', (_req,res)=> res.json({ ok:true, v:'2.12.3' }))

server.listen(4000, ()=> console.log('API v2.12.3 listening on 4000'))
