
import { Router } from 'express'
import { Client } from '@opensearch-project/opensearch'
import { v4 as uuid } from 'uuid'
export const router = Router()
const client = new Client({ node: process.env.OPENSEARCH_NODE || 'http://localhost:9200' })
router.post('/jobs', async (req,res)=>{
  const id=uuid(); await client.index({index:'tf_jobs', id, body:{id, ...req.body, ts:Date.now()}, refresh:'wait_for'}); res.json({ok:true,id})
})
router.get('/jobs', async (_q,res)=>{
  const r=await client.search({index:'tf_jobs',size:50,query:{match_all:{}},sort:[{ts:{order:'desc'}}]}); res.json(r.hits.hits.map(h=>h._source))
})
