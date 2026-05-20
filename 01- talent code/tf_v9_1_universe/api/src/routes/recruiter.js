
import { Router } from 'express'
import { v4 as uuid } from 'uuid'
import { Client } from '@opensearch-project/opensearch'
export const router = Router()

const node = process.env.OPENSEARCH_NODE || 'http://localhost:9200'
const client = new Client({ node })

router.post('/jobs', async (req,res)=>{
  const id = uuid()
  await client.index({ index:'tf_jobs@prod', id, body:{ id, ...req.body, ts: Date.now() }, refresh:'wait_for' })
  res.json({ ok:true, id })
})

router.get('/jobs', async (_req,res)=>{
  const r = await client.search({ index:'tf_jobs@prod', size:50, query:{ match_all:{} }, sort:[{ts:{order:'desc'}}] })
  res.json(r.hits.hits.map(h=>h._source))
})
