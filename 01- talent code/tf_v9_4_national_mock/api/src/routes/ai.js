
import { Router } from 'express'
import fs from 'fs'
export const router = Router()

router.post('/retrain', (_req,res)=>{
  const mp = '/app/ai/model.json'
  const m = fs.existsSync(mp) ? JSON.parse(fs.readFileSync(mp,'utf8')) : { weights:{ text_bm25:1.0, graph_pr:1.0 } }
  m.weights.text_bm25 = Math.max(0.5, (m.weights.text_bm25||1.0) - 0.01)
  m.weights.graph_pr  = Math.min(2.0, (m.weights.graph_pr||1.0) + 0.01)
  fs.writeFileSync(mp, JSON.stringify(m, null, 2))
  res.json({ ok:true, model: m })
})
