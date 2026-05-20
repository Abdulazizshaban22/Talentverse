import { Router } from 'express'
import { osClient, OS } from './opensearch_client.js'
export const search = Router()

const IDX_READ = { people:OS.PEOPLE_R, jobs:OS.JOBS_R, posts:OS.POSTS_R, course:OS.COUR_R }

search.post('/query', async (req,res)=>{
  const { type, q='' } = req.body||{}
  if(!type||!IDX_READ[type]) return res.status(400).json({ok:false})
  const r = await osClient.search({
    index: IDX_READ[type],
    body: { query: { bool: { must:[{ multi_match:{ query:q, fields:['text^3','title^2','skills^2','name^2','about','tags'] }},
                                 { term:{ tenantId: req.tenantId } } ] } }, size: 50 }
  })
  const results = (r.body.hits.hits||[]).map(h=>({ id:h._id, score:h._score, ...h._source }))
  res.json({ ok:true, results })
})
