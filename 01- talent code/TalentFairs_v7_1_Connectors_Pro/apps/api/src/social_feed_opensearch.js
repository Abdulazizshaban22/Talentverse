import { Router } from 'express'
import { osClient, ensureIndex } from './opensearch_client.js'

export const socialFeed = Router()
const INDEX = process.env.OS_INDEX_POSTS || 'tf_posts'

// Create/Index post
socialFeed.post('/post', async (req,res)=>{
  const { tenantId='public', authorId, text='', media=null, tags=[] } = req.body||{}
  if(!authorId || (!text && !media)) return res.status(400).json({ok:false, error:'missing_fields'})
  await ensureIndex(INDEX)
  const doc = { tenantId, type:'post', authorId, text, tags, ts: new Date(), likes:0, comments:0, media: !!media }
  const r = await osClient.index({ index: INDEX, body: doc, refresh:'wait_for' })
  res.json({ ok:true, id: r.body?._id })
})

// Like (increments)
socialFeed.post('/like', async (req,res)=>{
  const { id } = req.body||{}
  if(!id) return res.status(400).json({ok:false})
  await osClient.update({
    index: INDEX, id, refresh:'wait_for',
    body: { script: { source: 'ctx._source.likes += 1' } }
  })
  const d = await osClient.get({ index: INDEX, id })
  res.json({ ok:true, likes: d.body._source.likes })
})

// Comment (increments counter; body persisted elsewhere if needed)
socialFeed.post('/comment', async (req,res)=>{
  const { id } = req.body||{}
  if(!id) return res.status(400).json({ok:false})
  await osClient.update({
    index: INDEX, id, refresh:'wait_for',
    body: { script: { source: 'ctx._source.comments += 1' } }
  })
  const d = await osClient.get({ index: INDEX, id })
  res.json({ ok:true, comments: d.body._source.comments })
})

// Ranked timeline (affinity x quality x freshness approximated via function_score)
socialFeed.get('/feed', async (req,res)=>{
  const tenantId = String(req.query.tenantId||'public')
  const q = {
    index: INDEX,
    body: {
      query: {
        function_score: {
          query: { term: { tenantId } },
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
  }
  const r = await osClient.search(q)
  const items = (r.body.hits.hits||[]).map(h=>({ id:h._id, score:h._score, ...h._source }))
  res.json({ ok:true, items })
})
