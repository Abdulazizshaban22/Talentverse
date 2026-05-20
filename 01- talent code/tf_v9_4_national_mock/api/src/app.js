
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import http from 'http'
import { Server as IOServer } from 'socket.io'
import cron from 'node-cron'
import fs from 'fs'
import { verifyToken } from './jwt.js'

import { router as health } from './routes/health.js'
import { router as feed } from './routes/feed.js'
import { router as recruiter } from './routes/recruiter.js'
import { router as rewards } from './routes/rewards.js'
import { router as payments } from './routes/payments.js'
import { router as schools } from './routes/schools.js'
import { router as credentials } from './routes/credentials.js'
import { router as search } from './routes/search.js'
import { router as rankeval } from './routes/rankeval.js'
import { router as oneroster } from './routes/oneroster_rest.js'
import { router as skills } from './routes/skills_esco.js'
import { router as ai } from './routes/ai.js'

const app = express()
app.use(cors()); app.use(bodyParser.json({limit:'2mb'}))

app.use('/api/health', health)
app.use('/api/feed', feed)
app.use('/api/recruiter', recruiter)
app.use('/api/rewards', rewards)
app.use('/api/payments', payments)
app.use('/api/schools', schools)
app.use('/api/credentials', credentials)
app.use('/api/search', search)
app.use('/api/rankeval', rankeval)
app.use('/api/oneroster', oneroster)
app.use('/api/skills', skills)
app.use('/api/ai', ai)

const server = http.createServer(app)
const io = new IOServer(server, { cors: { origin: '*' } })

const CHANNEL_ROLES = {
  'chat': ['Student','Teacher','Employer','Admin'],
  'recruiter': ['Employer','Admin'],
  'feed': ['Student','Teacher','Employer','Admin']
}

io.use(async (socket, next)=>{
  try{
    const auth = socket.handshake.auth || {}
    const bearer = auth.token || socket.handshake.headers['authorization'] || ''
    const token = (''+bearer).replace(/^Bearer\s+/i,'')
    const payload = await verifyToken(token)
    socket.data.userId = payload.sub
    socket.data.roles = (payload.realm_access && payload.realm_access.roles) || payload.roles || []
    socket.data.name = payload.preferred_username || payload.email || payload.sub
    next()
  }catch(e){ next(new Error('AUTH_FAILED')) }
})

io.on('connection', (socket)=>{
  socket.on('join', ({channel})=>{
    const allowed = (CHANNEL_ROLES[channel]||[]).some(r => socket.data.roles.includes(r))
    if (!allowed) return socket.emit('acl:denied', { channel })
    socket.join(channel)
    socket.emit('acl:joined', { channel })
  })
  socket.on('typing', ({channel, isTyping})=>{
    if (!(CHANNEL_ROLES[channel]||[]).some(r => socket.data.roles.includes(r))) return
    socket.to(channel).emit('typing:update', { userId: socket.data.userId, isTyping })
  })
  socket.on('feed:post', (payload)=>{
    if (!(CHANNEL_ROLES['feed']||[]).some(r => socket.data.roles.includes(r))) return
    socket.to('feed').emit('feed:new', payload)
  })
  socket.on('recruiter:alert', (payload)=>{
    if (!(CHANNEL_ROLES['recruiter']||[]).some(r => socket.data.roles.includes(r))) return
    socket.to('recruiter').emit('recruiter:alert', payload)
  })
})

/** Auto-train cron (mock): يحفظ nDCG وهمي ويعدّل أوزان النموذج */
cron.schedule('0 3 * * *', ()=>{
  try {
    const p = '/app/metrics/ndcg.json'
    const now = Date.now()
    const val = Math.round((0.75 + Math.random()*0.1)*10000)/10000
    const rec = { ts: now, ndcg: val, variant: 'prod' }
    const old = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p,'utf8')) : []
    old.push(rec); fs.writeFileSync(p, JSON.stringify(old, null, 2))
    // update model weight (toy)
    const mp = '/app/ai/model.json'
    const m = fs.existsSync(mp) ? JSON.parse(fs.readFileSync(mp,'utf8')) : { weights:{ text_bm25:1.0, graph_pr:1.0 } }
    m.weights.graph_pr = Math.min(2.0, (m.weights.graph_pr||1.0) + 0.01)
    fs.writeFileSync(mp, JSON.stringify(m, null, 2))
    console.log('cron retrain mock done', rec)
  } catch(e){ console.error('cron error', e.message) }
})

const PORT = process.env.PORT || 4000
server.listen(PORT, ()=>console.log('API+WS (ACL) v9.4 running on :' + PORT))
