
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import http from 'http'
import { Server as IOServer } from 'socket.io'

import { router as health } from './routes/health.js'
import { router as feed } from './routes/feed.js'
import { router as recruiter } from './routes/recruiter.js'
import { router as rewards } from './routes/rewards.js'
import { router as payments } from './routes/payments.js'
import { router as schools } from './routes/schools.js'
import { router as credentials } from './routes/credentials.js'
import { router as search } from './routes/search.js'
import { router as rankeval } from './routes/rankeval.js'

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

const server = http.createServer(app)
const io = new IOServer(server, { cors: { origin: '*' } })

/** Realtime: presence + typing + alerts */
const presence = new Map() // userId -> {online:bool, last:ts}
io.on('connection', (socket)=>{
  socket.on('presence', ({userId, online})=>{
    presence.set(userId, { online, last: Date.now() })
    socket.broadcast.emit('presence:update', { userId, online })
  })
  socket.on('typing', ({channelId, userId, isTyping})=>{
    socket.to(channelId).emit('typing:update', { userId, isTyping })
  })
  socket.on('join', ({channelId})=> socket.join(channelId))
  socket.on('leave', ({channelId})=> socket.leave(channelId))
  socket.on('feed:post', (payload)=> socket.broadcast.emit('feed:new', payload))
  socket.on('recruiter:alert', (payload)=> socket.broadcast.emit('recruiter:alert', payload))
})

const PORT = process.env.PORT || 4000
server.listen(PORT, ()=>console.log('API+WS running on :' + PORT))
