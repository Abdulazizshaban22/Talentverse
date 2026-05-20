
'use client'
import { useState } from 'react'
export default function Skills(){
  const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
  const [input,setInput] = useState('Problem solving, Communication, Teamwork')
  const [mapped,setMapped] = useState([])
  async function run(){
    const skills = input.split(',').map(s=>s.trim()).filter(Boolean)
    const r = await fetch(API+'/api/skills/map',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ skills }) })
    const j = await r.json(); setMapped(j.mapped||[])
  }
  return (
    <main className="grid">
      <div className="card">
        <h2>تطبيع المهارات (ESCO)</h2>
        <input className="input" value={input} onChange={e=>setInput(e.target.value)} />
        <button className="btn" style={{marginTop:8}} onClick={run}>طبّق</button>
        <pre>{JSON.stringify(mapped,null,2)}</pre>
      </div>
    </main>
  )
}
