'use client'
import { useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const socket = io(API, { auth:{ token: '' } })

export default function Msg(){
  const [channel,setChannel]=useState('public:lobby')
  const [log,setLog]=useState<string[]>([])
  const [text,setText]=useState('')
  const typingRef = useRef<any>(null)

  useEffect(()=>{
    socket.emit('channel:join',{channel})
    socket.on('channel:joined', ({channel})=> setLog(x=>[...x, `✅ joined ${channel}`]))
    socket.on('channel:denied', ({channel})=> setLog(x=>[...x, `⛔ denied ${channel}`]))
    socket.on('typing', ({userId,on})=> setLog(x=>[...x, `${userId} ${on?'is typing…':'stopped typing'}`]))
    socket.on('msg:new', ({from,text})=> setLog(x=>[...x, `${from}: ${text}`]))
    return ()=>{ socket.off('channel:joined'); socket.off('channel:denied'); socket.off('typing'); socket.off('msg:new') }
  },[channel])

  function send(){
    socket.emit('msg:send',{channel,text}); setText('')
  }
  function typingStart(){
    if(typingRef.current) clearTimeout(typingRef.current)
    socket.emit('typing:start',{channel})
    typingRef.current = setTimeout(()=> socket.emit('typing:stop',{channel}), 1200)
  }

  return <main style={{padding:24}}>
    <h1>Messaging — Presence/Typing/ACL</h1>
    <div style={{marginBottom:12}}>
      <input value={channel} onChange={e=>setChannel(e.target.value)} style={{width:'60%'}}/> <small>مثال: recruiter:riyadh</small>
    </div>
    <div style={{display:'flex',gap:8}}>
      <input value={text} onChange={e=>{setText(e.target.value); typingStart()}} style={{flex:1}} placeholder="اكتب رسالة…"/>
      <button onClick={send}>إرسال</button>
    </div>
    <div style={{marginTop:12, padding:12, border:'1px solid #eee', height:280, overflow:'auto'}}>
      {log.map((l,i)=>(<div key={i}>{l}</div>))}
    </div>
  </main>
}
