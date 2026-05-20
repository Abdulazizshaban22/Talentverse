import { Router } from 'express'
export const messaging = Router()

const threads = {} // { threadId: { members:[userId], messages:[{id,from,text,ts}] } }

messaging.post('/thread', (req,res)=>{
  const { members=[] } = req.body||{}
  if(members.length<2) return res.status(400).json({ok:false})
  const id = Math.random().toString(36).slice(2)
  threads[id] = { members, messages: [] }
  res.json({ ok:true, threadId: id })
})

messaging.post('/send', (req,res)=>{
  const { threadId, from, text='' } = req.body||{}
  const t = threads[threadId]
  if(!t) return res.status(404).json({ok:false})
  const id = Math.random().toString(36).slice(2)
  t.messages.push({ id, from, text, ts: Date.now() })
  res.json({ ok:true, count: t.messages.length })
})

messaging.get('/thread', (req,res)=>{
  const id = String(req.query.threadId)
  const t = threads[id]
  if(!t) return res.status(404).json({ok:false})
  res.json({ ok:true, ...t })
})
