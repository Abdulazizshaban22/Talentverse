
import { Router } from 'express'
import { Client } from '@opensearch-project/opensearch'
import { v4 as uuid } from 'uuid'
export const router = Router()
const client = new Client({ node: process.env.OPENSEARCH_NODE || 'http://localhost:9200' })
router.post('/post', async (req,res)=>{
  const id = uuid(); const body = { id, ...req.body, ts: Date.now() }
  await client.index({ index:'tf_posts', id, body, refresh:'wait_for' })
  res.json({ ok:true, id })
})
router.get('/home', async (_req,res)=>{
  const r = await client.search({ index:'tf_posts', size:20, query:{ match_all:{} }, sort:[{ts:{order:'desc'}}] })
  res.json(r.hits.hits.map(h=>h._source))
})
