import express from 'express'
import http from 'http'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'

const prisma = new PrismaClient()
const app = express()
const server = http.createServer(app)
app.use(express.json({ limit:'3mb' }))

// ---- Rule Packs ----
const rulePacks:any = {
  "healthcare_base": {
    "name": "Healthcare — Clinical/Nursing Base",
    "sector": "Healthcare",
    "description": "مهارات سريرية أساسية + شهادات (BLS/ACLS اختيارية) + تفضيل خبرة طوارئ/عيادات + تواجد محلي",
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
            "emr",
            "triage"
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
        "points": 28
      },
      "else": {
        "decision": "manual_review",
        "points": 8
      }
    }
  },
  "fintech_aml": {
    "name": "FinTech — Risk/AML/KYC",
    "sector": "FinTech",
    "description": "تحقيق امتثال AML/KYC + Payments/FinTech + خبرة ≥2 سنوات؛ تفضيل شهادات CAMS/FRM",
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
            "aml",
            "kyc",
            "payments",
            "fintech"
          ]
        }
      ],
      "then": {
        "decision": "accept",
        "points": 32
      },
      "else": {
        "decision": "manual_review",
        "points": 10
      }
    }
  },
  "construction_site": {
    "name": "Construction — Site Engineer & Safety",
    "sector": "Construction",
    "description": "سلامة/موقع + AutoCAD/BIM + OSHA/NEBOSH مفضّل + خبرة ميدانية",
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
            "autocad",
            "bim",
            "safety"
          ]
        }
      ],
      "then": {
        "decision": "accept",
        "points": 24
      },
      "else": {
        "decision": "manual_review",
        "points": 6
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

// ---- CSV ingest + Stats (NDCG@k, coverage) ----
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

function ndcgAtK(items:any[], k:number): number {
  // items = [{label:number, score:number}] sorted by score desc
  const lg = (x:number)=> Math.log2(x+1)
  const top = items.slice(0, k)
  const dcg = top.reduce((acc,it,idx)=> acc + ((Math.pow(2, Number(it.label)) - 1) / lg(idx+2)), 0)
  // ideal
  const ideal = [...items].sort((a,b)=> Number(b.label) - Number(a.label)).slice(0,k)
  const idcg = ideal.reduce((acc,it,idx)=> acc + ((Math.pow(2, Number(it.label)) - 1) / lg(idx+2)), 0)
  if(idcg===0) return 0
  return dcg / idcg
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

  const jsonl = rows.map(r=> JSON.stringify({
    qid: Number(r.qid), label: Number(r.label),
    features: Object.keys(r).filter(k=>/^f\d+$/i.test(k)).map(k=> Number(r[k])),
    score: r.score!=null && r.score!=='' ? Number(r.score) : null
  })).join('\n')
  fs.writeFileSync(outFile, jsonl, 'utf-8')

  // Compute stats by query
  const groups: Record<string, any[]> = {}
  for(const r of rows){
    const q = String(r.qid)
    const feats = Object.keys(r).filter(k=>/^f\d+$/i.test(k))
    const score = (r.score!=null && r.score!=='') ? Number(r.score) : feats.reduce((s,k)=> s + Number(r[k]||0), 0)
    const label = Number(r.label||0)
    ;(groups[q] ||= []).push({ score, label })
  }
  let sum5=0, sum10=0, cnt=0, grpWithPos=0
  for(const q of Object.keys(groups)){
    const items = groups[q].sort((a,b)=> b.score - a.score)
    const hasPos = items.some(x=> Number(x.label)>0)
    if(hasPos) grpWithPos += 1
    sum5  += ndcgAtK(items, 5)
    sum10 += ndcgAtK(items, 10)
    cnt   += 1
  }
  const ndcg5 = cnt? (sum5/cnt) : 0
  const ndcg10 = cnt? (sum10/cnt) : 0
  const coveragePos = cnt? (grpWithPos/cnt) : 0

  res.json({ ok:true, file: outFile, rows: rows.length, groups: cnt, ndcg5, ndcg10, coveragePos })
})

// ---- Train LightGBM (local) ----
app.post('/ranker/train', async (_req,res)=>{
  const dataDir = path.join(process.cwd(), 'data', 'rank')
  const modelDir = path.join(process.cwd(), 'models', 'ranker')
  fs.mkdirSync(modelDir, { recursive: true })
  const py = path.join(process.cwd(), 'services', 'ai-ltr', 'train_ltr.py')
  const latestJsonl = fs.existsSync(dataDir) ? (fs.readdirSync(dataDir).filter(n=>n.endsWith('.jsonl')).sort().slice(-1)[0]||null) : null
  if(!latestJsonl) {
    // create a tiny demo dataset
    fs.mkdirSync(dataDir, { recursive: true })
    const demo = [
      { qid:1, features:[0.8,0.2,0.4], label:1 },
      { qid:1, features:[0.6,0.1,0.2], label:0 },
      { qid:2, features:[0.1,0.9,0.7], label:1 }
    ].map(x=> JSON.stringify(x)).join('\n')
    fs.writeFileSync(path.join(dataDir, 'demo.jsonl'), demo, 'utf-8')
  }
  const dataFile = latestJsonl ? path.join(dataDir, latestJsonl) : path.join(dataDir, 'demo.jsonl')
  const outFile = path.join(modelDir, 'model.txt')

  // Try to run python trainer; if fails, create placeholder model.
  const trySpawn = () => new Promise(resolve=>{
    let done=false
    try {
      const p = spawn('python', [py, '--data', dataFile, '--out', outFile])
      p.on('close', (code)=>{ done=True; resolve(code===0) })
      p.on('error', (_e)=>{ if(!done) resolve(False as any) })
    } catch(_e) { resolve(False as any) }
  })
  const ok:any = await trySpawn()
  if(!ok) {
    // write placeholder
    const meta = { createdAt: new Date().toISOString(), algorithm:'lightgbm-lambdarank', note:'placeholder — run python services/ai-ltr/train_ltr.py' }
    fs.writeFileSync(outFile, JSON.stringify(meta,null,2), 'utf-8')
    return res.json({ ok:true, msg:'تم إنشاء نموذج افتراضي — شغّل سكربت Python للتدريب الحقيقي', model: outFile })
  }
  res.json({ ok:true, msg:'تم تدريب النموذج وتخزينه', model: outFile, data: dataFile })
})

app.get('/health', (_req,res)=> res.json({ ok:true, v:'2.12.2' }))

server.listen(4000, ()=> console.log('API v2.12.2 listening on 4000'))
