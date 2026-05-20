'use client'
import { useEffect, useRef, useState } from 'react'

export default function RealtimePro(){
  const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
  const [channel,setChannel]=useState('general')
  const [token,setToken]=useState('') // Keycloak access token
  const [log,setLog]=useState<string[]>([])
  const [online,setOnline]=useState<number>(0)
  const [typing,setTyping]=useState<string[]>([])
  const inputRef=useRef<HTMLInputElement>(null)

  useEffect(()=>{
    const s = document.createElement('script')
    s.src = 'https://cdn.socket.io/4.7.5/socket.io.min.js'
    s.onload = ()=>{
      // @ts-ignore
      const socket = (window as any).io(API, { transports: ['websocket','polling'], auth:{ token } })
      socket.on('connect', ()=> push('connected'))
      socket.emit('join', { channel })
      socket.on('presence', (p:any)=> setOnline(p.count))
      socket.on('typing', (p:any)=> setTyping(p.users||[]))
      socket.on('message', (m:any)=> push(`msg:${m.userId}: ${m.text}`))
      const int = setInterval(()=> socket.emit('presence:ping', { channel }), 8000)
      return ()=> { clearInterval(int); socket.disconnect() }
    }
    document.body.appendChild(s)
    return ()=>{}
  },[channel, token])

  function push(t:string){ setLog(prev=> [t, ...prev].slice(0,100)) }
  async function send(){
    const text = inputRef.current?.value||''
    if(!text) return
    await fetch(API+'/realtime/send', { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body: JSON.stringify({ channel, text }) })
    inputRef.current!.value=''
  }
  async function onTyping(){
    await fetch(API+'/realtime/typing', { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body: JSON.stringify({ channel }) })
  }

  return <main style={{padding:24,maxWidth:900,margin:'0 auto'}}>
    <h2>البث المتقدم (قنوات + AuthZ + Presence + Typing)</h2>
    <div style={{display:'grid',gap:8,gridTemplateColumns:'1fr 1fr'}}>
      <input value={channel} onChange={e=>setChannel(e.target.value)} placeholder="القناة"/>
      <input value={token} onChange={e=>setToken(e.target.value)} placeholder="JWT من Keycloak"/>
    </div>
    <div style={{display:'flex',gap:8,margin:'12px 0'}}>
      <input ref={inputRef} onChange={onTyping} style={{flex:1}} placeholder="اكتب رسالة..."/>
      <button onClick={send}>إرسال</button>
    </div>
    <div style={{fontSize:12,opacity:.7,marginBottom:8}}>المتصلون: {online} — يكتب الآن: {typing.join(', ')}</div>
    <ul>{log.map((t,i)=> <li key={i} style={{marginBottom:6}}>{t}</li>)}</ul>
  </main>
}
