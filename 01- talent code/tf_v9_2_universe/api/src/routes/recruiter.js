
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

router.post('/applicants', async (req,res)=>{
  const { jobId, applicant } = req.body
  const id = uuid()
  await client.index({ index:'tf_applicants@prod', id, body:{ id, jobId, ...applicant, ts: Date.now() }, refresh:'wait_for' })
  res.json({ ok:true, id })
})

router.get('/match', async (req,res)=>{
  const { jobId } = req.query
  try{
    const job = await client.get({ index:'tf_jobs@prod', id: jobId })
    const skills = job?.body?._source?.skills || job?._source?.skills || []
    const r = await client.search({
      index: 'tf_people@prod', size: 20,
      query: skills.length? { terms: { "skills.keyword": skills } } : { match_all:{} }
    })
    res.json({ ok:true, jobId, candidates: r.hits.hits.map(h=>h._source) })
  }catch(e){
    res.status(404).json({ ok:false, error:'JOB_NOT_FOUND' })
  }
})
