import { Router } from 'express'
export const search = Router()

const idx = { people:[], jobs:[], posts:[], courses:[] }
search.post('/index', (req,res)=>{
  const { type, doc } = req.body||{}
  if(!type||!doc) return res.status(400).json({ok:false})
  idx[type] = idx[type] || []
  idx[type].push(doc)
  res.json({ ok:true, count: idx[type].length })
})
search.post('/query', (req,res)=>{
  const { type, q='' } = req.body||{}
  const list = (idx[type]||[]).filter(d=> JSON.stringify(d).toLowerCase().includes(q.toLowerCase()) )
  res.json({ ok:true, results: list.slice(0,50) })
})
