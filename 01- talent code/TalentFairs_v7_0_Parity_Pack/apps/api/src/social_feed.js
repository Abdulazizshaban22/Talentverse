import { Router } from 'express'
export const socialFeed = Router()

// In-memory demo stores
const posts = []  // {id, authorId, text, media, ts, likes:Set, comments:[{id,authorId,text,ts}]}
const follows = {} // { userId: Set(followedUserId) }
const endorsements = {} // { userId: { skill: count } }

function scorePost(p, viewerId){
  const recency = 1 / Math.max(1, (Date.now()-p.ts)/3600000)  // hours decay
  const affinity = follows[viewerId]?.has(p.authorId) ? 1.2 : 1.0
  const quality = 1 + (p.likes?.size||0)*0.1 + (p.comments?.length||0)*0.2
  return recency * affinity * quality
}

// Create post
socialFeed.post('/post', (req,res)=>{
  const { authorId, text='', media=null } = req.body||{}
  if(!authorId || (!text && !media)) return res.status(400).json({ok:false, error:'missing_fields'})
  const id = Math.random().toString(36).slice(2)
  const row = { id, authorId, text, media, ts: Date.now(), likes:new Set(), comments:[] }
  posts.push(row)
  res.json({ ok:true, id })
})

// Timeline
socialFeed.get('/feed', (req,res)=>{
  const viewerId = String(req.query.viewerId||'demo')
  const ranked = posts.slice().sort((a,b)=> scorePost(b,viewerId)-scorePost(a,viewerId))
  res.json({ ok:true, items: ranked.map(p=>({...p, likes:[...p.likes]})) })
})

// Like
socialFeed.post('/like', (req,res)=>{
  const { postId, userId } = req.body||{}
  const p = posts.find(x=>x.id===postId)
  if(!p) return res.status(404).json({ok:false})
  p.likes.add(userId)
  res.json({ ok:true, likes: p.likes.size })
})

// Comment
socialFeed.post('/comment', (req,res)=>{
  const { postId, userId, text='' } = req.body||{}
  const p = posts.find(x=>x.id===postId)
  if(!p) return res.status(404).json({ok:false})
  const id = Math.random().toString(36).slice(2)
  p.comments.push({ id, authorId:userId, text, ts: Date.now() })
  res.json({ ok:true, comments: p.comments.length })
})

// Follow / Connect
socialFeed.post('/follow', (req,res)=>{
  const { userId, targetId } = req.body||{}
  if(!userId||!targetId) return res.status(400).json({ok:false})
  follows[userId] = follows[userId] || new Set()
  follows[userId].add(targetId)
  res.json({ ok:true, following: [...follows[userId]] })
})

// Endorsements
socialFeed.post('/endorse', (req,res)=>{
  const { targetId, skill } = req.body||{}
  if(!targetId||!skill) return res.status(400).json({ok:false})
  endorsements[targetId] = endorsements[targetId] || {}
  endorsements[targetId][skill] = (endorsements[targetId][skill]||0)+1
  res.json({ ok:true, endorsements: endorsements[targetId] })
})
