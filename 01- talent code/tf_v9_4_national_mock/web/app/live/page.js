
'use client'
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { motion } from 'framer-motion'

export default function Live(){
  const [status,setStatus] = useState('connecting...')
  const [events,setEvents] = useState([])

  useEffect(()=>{
    const token = 'PLACE_YOUR_JWT' // ضع توكن كيكلوك هنا لاختبار ACL
    const url = typeof window!=='undefined' ? window.location.origin.replace(':3000',':4000') : 'http://localhost:4000'
    const socket = io(url, { transports:['websocket','polling'], auth:{ token: 'Bearer '+token } })
    socket.on('connect', ()=> setStatus('connected'))
    socket.on('acl:denied', (e)=> setEvents(x=>[...x, 'ACL denied:'+JSON.stringify(e)]))
    socket.on('acl:joined', (e)=> setEvents(x=>[...x, 'joined:'+e.channel]))
    socket.on('typing:update', (e)=> setEvents(x=>[...x, `typing:${e.userId}:${e.isTyping}`]))
    socket.on('feed:new', (p)=> setEvents(x=>[...x, `feed:new:${p.id||''}`]))
    socket.emit('join',{channel:'feed'})
    return ()=> socket.disconnect()
  },[])

  return (
    <main className="grid">
      <motion.div className="card" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
        <h2>البث الحي (ACL)</h2>
        <p className="muted">Socket.IO status: {status}</p>
        <pre>{events.join('\n')}</pre>
      </motion.div>
    </main>
  )
}
