'use client'
import { useState } from 'react'
const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
export default function Exports(){
  const [q,setQ]=useState('data science')
  const [out,setOut]=useState<any>(null)
  async function esco(){ const r=await fetch(`${API}/esco/search?q=${encodeURIComponent(q)}`); setOut(await r.json()) }
  return <main style={{padding:24}}>
    <h2>ESCO / Europass / HR‑Open</h2>
    <div style={{display:'flex',gap:8}}>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="بحث ESCO"/>
      <button onClick={esco}>بحث ESCO</button>
    </div>
    {out && <pre style={{whiteSpace:'pre-wrap',marginTop:12}}>{JSON.stringify(out,null,2)}</pre>}
  </main>
}
