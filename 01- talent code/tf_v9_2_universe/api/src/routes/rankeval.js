
import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { Client } from '@opensearch-project/opensearch'

export const router = Router()
const client = new Client({ node: process.env.OPENSEARCH_NODE || 'http://localhost:9200' })
const store = '/tmp/rankeval_judgments.json'

function readStore(){
  if (!fs.existsSync(store)) return []
  try{ return JSON.parse(fs.readFileSync(store,'utf8')) } catch{ return [] }
}
function writeStore(arr){ fs.writeFileSync(store, JSON.stringify(arr, null, 2)) }

function ndcgAtK(rels, k=10){
  const dcg = (a)=> a.slice(0,k).reduce((acc,r,i)=> acc + ((2**r - 1)/Math.log2(i+2)), 0)
  const ideal = [...rels.slice(0,k)].sort((a,b)=>b-a)
  const d = dcg(rels); const id = dcg(ideal)
  return id>0 ? d/id : 0
}

/** جمع أحكام من الواجهة (نوع/قيمة/مؤشر/كيوورد…) */
router.post('/collect', (req,res)=>{
  const arr = readStore()
  arr.push({ ts: Date.now(), ...req.body })
  writeStore(arr)
  res.json({ ok:true, count: arr.length })
})

/** تقييم nDCG سريع من قيم جاهزة */
router.post('/ndcg', (req,res)=>{
  const { relevances=[], k=10 } = req.body
  const v = ndcgAtK(relevances, k)
  res.json({ ok:true, ndcg: v })
})

/** التفويض إلى OpenSearch _rank_eval باستخدام body القادم من الواجهة */
router.post('/opensearch', async (req,res)=>{
  const { index='tf_posts@shadow', body={} } = req.body
  try{
    const r = await client.transport.request({ method:'POST', path:`/${encodeURIComponent(index)}/_rank_eval`, body })
    res.json({ ok:true, result: r.body || r })
  }catch(e){
    res.status(400).json({ ok:false, error: e.message })
  }
})

/** تبديل alias @prod إلى index جديد بعد نجاح الاختبارات */
router.post('/aliases/cutover', async (req,res)=>{
  const { indexBase='tf_posts', to='tf_posts-000002' } = req.body
  try{
    await client.indices.updateAliases({
      body: {
        actions: [
          { remove: { index: '*', alias: `${indexBase}@prod` } },
          { add: { index: to, alias: `${indexBase}@prod` } }
        ]
      }
    })
    res.json({ ok:true })
  }catch(e){ res.status(400).json({ ok:false, error:e.message }) }
})
