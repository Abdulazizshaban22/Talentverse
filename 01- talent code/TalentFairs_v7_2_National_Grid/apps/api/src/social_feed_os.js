import { Router } from 'express'
import { osClient, OS } from './opensearch_client.js'

export const socialFeed = Router()

socialFeed.post('/post', async (req,res)=>{
  const { authorId, text='', tags=[] } = req.body||{}
  if(!authorId || (!text && !tags.length)) return res.status(400).json({ok:false})
  const doc = { tenantId:req.tenantId, type:'post', authorId, text, tags, ts:new Date(), likes:0, comments:0 }
  const r = await osClient.index({ index: OS.POSTS_W, body: doc, refresh:'wait_for' })
  res.json({ ok:true, id: r.body?._id })
})

socialFeed.get('/feed', async (req,res)=>{
  const body = {
    query: {
      function_score: {
        query: { term: { tenantId: req.tenantId } },
        functions: [
          { field_value_factor: { field:'likes', factor:0.1 } },
          { field_value_factor: { field:'comments', factor:0.2 } },
          { exp: { ts: { origin:'now', scale:'6h', decay:0.6 } } }
        ],
        score_mode: 'sum', boost_mode: 'sum'
      }
    },
    size: 50
  }
  const r = await osClient.search({ index: OS.POSTS_R, body })
  const items = (r.body.hits.hits||[]).map(h=>({ id:h._id, score:h._score, ...h._source }))
  res.json({ ok:true, items })
})
