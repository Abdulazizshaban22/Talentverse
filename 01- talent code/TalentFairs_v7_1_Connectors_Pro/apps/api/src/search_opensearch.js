import { Router } from 'express'
import { osClient, ensureIndex } from './opensearch_client.js'
export const search = Router()

const IDX = {
  people : process.env.OS_INDEX_PEOPLE  || 'tf_people',
  jobs   : process.env.OS_INDEX_JOBS    || 'tf_jobs',
  posts  : process.env.OS_INDEX_POSTS   || 'tf_posts',
  course : process.env.OS_INDEX_COURSE  || 'tf_courses'
}

async function indexDoc(type, doc){
  await ensureIndex(IDX[type])
  await osClient.index({ index: IDX[type], body: doc, refresh:'wait_for' })
}

search.post('/index', async (req,res)=>{
  const { type, doc } = req.body||{}
  if(!type||!doc||!IDX[type]) return res.status(400).json({ok:false})
  await indexDoc(type, doc)
  res.json({ ok:true })
})

search.post('/query', async (req,res)=>{
  const { type, q='' } = req.body||{}
  if(!type||!IDX[type]) return res.status(400).json({ok:false})
  const body = {
    query: { multi_match: { query: q, fields: ['text^3','title^2','skills^2','name^2','about','tags'] } },
    size: 50
  }
  const r = await osClient.search({ index: IDX[type], body })
  const results = (r.body.hits.hits||[]).map(h=>({ id:h._id, score:h._score, ...h._source }))
  res.json({ ok:true, results })
})
