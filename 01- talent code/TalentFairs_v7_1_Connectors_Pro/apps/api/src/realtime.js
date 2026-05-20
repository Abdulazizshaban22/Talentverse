import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'

// Presence store (in-memory). Use Redis adapter in prod.
const online = new Map() // userId -> { socketId, ts }
const typing = new Set() // `${channel}:${userId}`

export function initRealtime(httpServer){
  const io = new Server(httpServer, { cors: { origin: '*' } })

  io.use((socket, next)=>{
    // Optional: verify JWT (Keycloak) to extract userId & roles
    const token = socket.handshake.auth?.token || socket.handshake.headers['x-auth-token']
    if(token){
      try{
        const payload = jwt.decode(token) || {}
        socket.userId = payload.sub || payload.preferred_username || 'anon'
        socket.roles  = payload.realm_access?.roles || []
      }catch{ socket.userId = 'anon'; socket.roles=[] }
    } else { socket.userId = 'anon'; socket.roles=[] }
    next()
  })

  io.on('connection', socket => {
    online.set(socket.userId, { socketId: socket.id, ts: Date.now() })
    socket.emit('presence:online', { userId: socket.userId })
    socket.on('disconnect', ()=> online.delete(socket.userId))

    // Channels ACL hook (example: only recruiters can join "recruiter:*")
    socket.on('channel:join', ({ channel })=>{
      if(channel?.startsWith('recruiter:') && !socket.roles.includes('recruiter')){
        socket.emit('channel:denied', { channel }); return
      }
      socket.join(channel); socket.emit('channel:joined', { channel })
    })

    // Typing indicator
    socket.on('typing:start', ({ channel })=>{
      const key = `${channel}:${socket.userId}`
      typing.add(key)
      socket.to(channel).emit('typing', { userId: socket.userId, on:true })
    })
    socket.on('typing:stop', ({ channel })=>{
      const key = `${channel}:${socket.userId}`
      typing.delete(key)
      socket.to(channel).emit('typing', { userId: socket.userId, on:false })
    })

    // Messaging
    socket.on('msg:send', ({ channel, text })=>{
      io.to(channel).emit('msg:new', { from: socket.userId, text, ts: Date.now() })
    })
  })

  return io
}
