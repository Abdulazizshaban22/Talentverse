
import { Router } from 'express'
import { Client } from '@opensearch-project/opensearch'
export const router = Router()
const client = new Client({ node: process.env.OPENSEARCH_NODE || 'http://localhost:9200' })

router.get('/people', async (_req,res)=>{
  const r = await client.search({ index:'tf_people@prod', size:100, query:{ match_all:{} } })
  res.json(r.hits.hits.map(h=>h._source))
})
router.get('/classes', async (_req,res)=>{
  const r = await client.search({ index:'tf_classes@prod', size:100, query:{ match_all:{} } })
  res.json(r.hits.hits.map(h=>h._source))
})
router.get('/enrollments', async (_req,res)=>{
  const r = await client.search({ index:'tf_enrollments@prod', size:100, query:{ match_all:{} } })
  res.json(r.hits.hits.map(h=>h._source))
})
router.get('/academicSessions', async (_req,res)=>{
  const r = await client.search({ index:'tf_academicSessions@prod', size:100, query:{ match_all:{} } })
  res.json(r.hits.hits.map(h=>h._source))
})
