
'use client'
import { useEffect } from 'react'
import { io } from 'socket.io-client'
export default function Realtime(){
  useEffect(()=>{
    const s = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8000', { query: { userId: 'demo-org' }})
    s.on('connect', ()=> console.log('socket connected'))
    return ()=> { s.close() }
  },[])
  return <main style={{padding:24}}><h2>إرسال دعوات</h2><p>استخدم API لإرسال حدث invite من الجهة.</p></main>
}
