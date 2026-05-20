'use client'
import { useEffect, useState } from 'react'
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function Feed(){
  const [items,setItems]=useState<any[]>([])
  const [text,setText]=useState('')
  async function load(){ const r=await fetch(`${API}/social/feed?tenantId=public`); const j=await r.json(); setItems(j.items||[]) }
  async function post(){ await fetch(`${API}/social/post`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({authorId:'demo',text})}); setText(''); load() }
  useEffect(()=>{ load() },[])
  return <main style={{padding:24}}>
    <h1>الصفحة الرئيسية — Feed (OpenSearch)</h1>
    <div style={{display:'flex', gap:8}}>
      <input value={text} onChange={e=>setText(e.target.value)} placeholder="اكتب منشورك…" style={{flex:1,padding:8}}/>
      <button onClick={post}>نشر</button>
    </div>
    <ul style={{marginTop:16}}>
      {items.map(p=>(
        <li key={p.id} style={{padding:12, border:'1px solid #eee', borderRadius:8, marginBottom:8}}>
          <div style={{fontSize:12, opacity:0.6}}>{new Date(p.ts).toLocaleString()}</div>
          <div style={{marginTop:6}}>{p.text}</div>
          <div style={{fontSize:12, opacity:0.7}}>Score: {Math.round(p.score*100)/100} · ❤️ {p.likes} · 💬 {p.comments}</div>
        </li>
      ))}
    </ul>
  </main>
}
