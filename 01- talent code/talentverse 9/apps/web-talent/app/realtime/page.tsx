
'use client'
import { useEffect } from 'react'
import { io } from 'socket.io-client'
export default function Realtime(){
  useEffect(()=>{
    const s = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8000', { query: { userId: 'demo-talent' }})
    s.on('connect', ()=> console.log('socket connected'))
    s.on('invite', (m:any)=> alert('دعوة جديدة: ' + JSON.stringify(m)))
    return ()=> { s.close() }
  },[])
  return <main style={{padding:24}}><h2>قناة التحديثات اللحظية</h2></main>
}
