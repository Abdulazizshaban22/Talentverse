import { Router } from 'express'
export const lms = Router()

const courses = [] // {id,title,about,price,lessons:[{id,title,html}],provider}
const enrollments = {} // userId -> Set(courseId)

lms.post('/course', (req,res)=>{
  const { title, about='', price=0, provider='TalentFairs' } = req.body||{}
  if(!title) return res.status(400).json({ok:false})
  const id = Math.random().toString(36).slice(2)
  courses.push({ id, title, about, price:Number(price), provider, lessons:[] })
  res.json({ ok:true, id })
})

lms.get('/course/list', (_req,res)=> res.json({ ok:true, courses }))

lms.post('/course/lesson', (req,res)=>{
  const { courseId, title, html='' } = req.body||{}
  const c = courses.find(x=>x.id===courseId)
  if(!c) return res.status(404).json({ok:false})
  const id = Math.random().toString(36).slice(2)
  c.lessons.push({ id, title, html })
  res.json({ ok:true, lessons: c.lessons.length })
})

lms.post('/enroll', (req,res)=>{
  const { userId, courseId } = req.body||{}
  if(!userId||!courseId) return res.status(400).json({ok:false})
  enrollments[userId] = enrollments[userId] || new Set()
  enrollments[userId].add(courseId)
  res.json({ ok:true, enrolled: [...enrollments[userId]] })
})

// LTI 1.3 (very simplified placeholders)
lms.get('/lti/config', (_req,res)=>{
  res.json({ ok:true, issuer:"https://talentfairs.sa", jwks_uri:"https://api.talentfairs.sa/.well-known/jwks.json" })
})
lms.post('/lti/launch', (_req,res)=> res.json({ ok:true, msg:"LTI launch accepted (stub)" }))

// xAPI/SCORM ingest stubs
lms.post('/xapi/statement', (_req,res)=> res.json({ ok:true, accepted:true }))
lms.post('/scorm/commit', (_req,res)=> res.json({ ok:true, committed:true }))
