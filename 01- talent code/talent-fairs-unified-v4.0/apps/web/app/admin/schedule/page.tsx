'use client'
import { useState } from 'react'
const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
export default function Schedule(){
  const [title,setTitle]=useState('Term 1 — Cognitive Snapshot')
  const [due,setDue]=useState('2026-01-15')
  const [out,setOut]=useState<any>(null)
  async function create(){ const r=await fetch(API+'/schedule/terms',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,dueDate:due})}); setOut(await r.json()) }
  return <main style={{padding:24}}>
    <h2>الجدولة</h2>
    <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="العنوان"/><input value={due} onChange={e=>setDue(e.target.value)} placeholder="YYYY-MM-DD"/>
    <button onClick={create}>حفظ</button>
    {out && <pre style={{whiteSpace:'pre-wrap',marginTop:12}}>{JSON.stringify(out,null,2)}</pre>}
  </main>
}
