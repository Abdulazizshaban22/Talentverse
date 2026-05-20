
'use client'
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

export default function Live(){
  const [status,setStatus] = useState('connecting...')
  const [typing,setTyping] = useState(false)
  const [events,setEvents] = useState([])
  useEffect(()=>{
    const socket = io(typeof window!=='undefined' ? window.location.origin.replace(':3000',':4000') : 'http://localhost:4000', { transports:['websocket','polling'] })
    socket.on('connect', ()=> setStatus('connected'))
    socket.emit('join',{channelId:'general'})
    socket.on('typing:update', (e)=> setEvents(x=>[...x, `typing:${e.userId}:${e.isTyping}`]))
    socket.on('feed:new', (p)=> setEvents(x=>[...x, `feed:new:${p.id||''}`]))
    return ()=> socket.disconnect()
  },[])
  return (
    <main className="grid">
      <div className="card">
        <h2>البث الحي</h2>
        <p className="muted">Socket.IO status: {status}</p>
        <label><input type="checkbox" checked={typing} onChange={e=>setTyping(e.target.checked)} /> أكتب الآن</label>
        <p className="muted">الأحداث:</p>
        <pre>{events.join('\n')}</pre>
      </div>
    </main>
  )
}
