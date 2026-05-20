// Example presence counting with Socket.IO v4+
// Each user joins a private room = their userId. We can check online presence by fetchSockets().
import { Server } from 'socket.io'

export function attachPresence(server){
  const io = new Server(server, { cors: { origin: '*' } })
  io.on('connection', (socket)=>{
    const userId = (socket.handshake.auth && socket.handshake.auth.userId) || 'guest:'+socket.id
    socket.join(userId)
    socket.on('disconnect', ()=>{})
  })
  return {
    async isOnline(userId){
      const sockets = await io.in(userId).fetchSockets()
      return sockets.length > 0
    },
    io
  }
}
