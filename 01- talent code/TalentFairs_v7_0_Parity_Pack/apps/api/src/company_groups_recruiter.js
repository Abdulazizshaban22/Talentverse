import { Router } from 'express'
export const biz = Router()

const companies = [] // {id,name,about,admins:Set,followers:Set}
const groups = []    // {id,name,about,admins:Set,members:Set}
const candidates = [] // {id,name,skills:[s],location,experience,score}
const savedSearches = {} // recruiterId -> [{id,query,filters,ts}]

biz.post('/company', (req,res)=>{
  const { name, about='', adminId } = req.body||{}
  if(!name||!adminId) return res.status(400).json({ok:false})
  const id = Math.random().toString(36).slice(2)
  companies.push({ id, name, about, admins:new Set([adminId]), followers:new Set() })
  res.json({ ok:true, id })
})

biz.post('/company/follow', (req,res)=>{
  const { companyId, userId } = req.body||{}
  const c = companies.find(x=>x.id===companyId)
  if(!c) return res.status(404).json({ok:false})
  c.followers.add(userId)
  res.json({ ok:true, followers: c.followers.size })
})

biz.post('/group', (req,res)=>{
  const { name, about='', adminId } = req.body||{}
  if(!name||!adminId) return res.status(400).json({ok:false})
  const id = Math.random().toString(36).slice(2)
  groups.push({ id, name, about, admins:new Set([adminId]), members:new Set([adminId]) })
  res.json({ ok:true, id })
})

biz.post('/group/join', (req,res)=>{
  const { groupId, userId } = req.body||{}
  const g = groups.find(x=>x.id===groupId)
  if(!g) return res.status(404).json({ok:false})
  g.members.add(userId)
  res.json({ ok:true, members: g.members.size })
})

// Recruiter: search candidates (demo filter)
biz.post('/recruiter/search', (req,res)=>{
  const { query='', skills=[], location='' } = req.body||{}
  const results = candidates.filter(c=>
    (!skills.length || skills.every(s=>c.skills.includes(s))) &&
    (!location || c.location===location) &&
    (query==='' || c.name.toLowerCase().includes(query.toLowerCase()))
  ).slice(0,50)
  res.json({ ok:true, results })
})

biz.post('/recruiter/save-search', (req,res)=>{
  const { recruiterId, query, filters={} } = req.body||{}
  const id = Math.random().toString(36).slice(2)
  savedSearches[recruiterId] = savedSearches[recruiterId] || []
  savedSearches[recruiterId].push({ id, query, filters, ts: Date.now() })
  res.json({ ok:true, saved: savedSearches[recruiterId] })
})

// Seed some demo candidates
candidates.push(
  { id:'u1', name:'Aziz', skills:['Next.js','Node','GIS'], location:'Riyadh', experience:6, score:86 },
  { id:'u2', name:'Noura', skills:['Data','Python','NLP'], location:'Jeddah', experience:4, score:82 },
  { id:'u3', name:'Faisal', skills:['DevOps','Terraform','AWS'], location:'Khobar', experience:7, score:90 }
)
