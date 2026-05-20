
import { Router } from 'express'
import { Client } from '@opensearch-project/opensearch'
import { v4 as uuid } from 'uuid'
export const router = Router()

const node = process.env.OPENSEARCH_NODE || 'http://localhost:9200'
const auth = process.env.OPENSEARCH_AUTH
const client = new Client({ node, ...(auth?{auth:{username:auth.split(':')[0],password:auth.split(':')[1]}}:{}) })

const POSTS='tf_posts@prod'   // alias للإنتاج
const INTER='tf_interactions@prod'

router.post('/post', async (req,res)=>{
  const { authorId, text, media=[] } = req.body
  const id = uuid()
  await client.index({ index: POSTS, id, body:{ id, authorId, text, media, ts: Date.now(), type:'post' }, refresh:'wait_for' })
  res.json({ ok:true, id })
})

router.get('/home', async (req,res)=>{
  const { q='' } = req.query
  const r = await client.search({
    index: POSTS, size: 20,
    query: q ? { multi_match:{ query:q, fields:['text^2','authorId'] } } : { match_all:{} },
    sort: [{ ts: { order: 'desc' } }]
  })
  res.json(r.hits.hits.map(h=>h._source))
})

router.post('/interact', async (req,res)=>{
  const { postId, userId, type } = req.body  // like/comment/save
  const id = uuid()
  await client.index({ index: INTER, id, body:{ id, postId, userId, type, ts: Date.now() }, refresh:'wait_for' })
  res.json({ ok:true })
})
