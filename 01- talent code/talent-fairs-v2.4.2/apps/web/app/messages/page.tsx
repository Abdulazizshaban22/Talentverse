'use client'
import { useEffect, useState } from 'react'
export default function Messages(){
  const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
  const [me,setMe]=useState('userA')
  const [peer,setPeer]=useState('userB')
  const [text,setText]=useState('')
  const [inbox,setInbox]=useState<any[]>([])
  async function load(){ const r=await fetch(`${API}/messages/inbox?userId=${me}`); setInbox(await r.json()) }
  async function send(){ await fetch(API+'/messages/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fromUserId:me,toUserId:peer,body:text})}); setText(''); await load() }
  useEffect(()=>{ load() },[me])
  return <main style={{padding:24,maxWidth:700,margin:'0 auto'}}>
    <h2>الرسائل الخاصة</h2>
    <div style={{display:'flex',gap:8,marginBottom:8}}>
      <input placeholder="أنا" value={me} onChange={e=>setMe(e.target.value)}/>
      <input placeholder="المستلم" value={peer} onChange={e=>setPeer(e.target.value)}/>
    </div>
    <div style={{display:'flex',gap:8}}>
      <input style={{flex:1}} placeholder="اكتب رسالة..." value={text} onChange={e=>setText(e.target.value)}/>
      <button onClick={send}>إرسال</button>
    </div>
    <h3 style={{marginTop:16}}>الوارد</h3>
    <div>{inbox.map((m:any)=> <div key={m.id} style={{border:'1px solid #eee',padding:8,borderRadius:8,marginBottom:8}}>
      <div style={{fontSize:12,opacity:.7}}>{m.createdAt}</div>
      <div><b>{m.fromUserId}</b> → {m.toUserId}</div>
      <div>{m.body}</div>
    </div>)}</div>
  </main>
}
