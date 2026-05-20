
'use client'
import { useState } from 'react'
export default function QBE(){
  const [text, setText] = useState('Python backend engineer with FastAPI and Postgres experience...')
  const [rows, setRows] = useState<any[]>([])
  async function run(){
    const r = await fetch('/api/proxy/v1/org/qbe', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ text, topk: 10 }) })
    const j = await r.json(); setRows(j.results||[])
  }
  return <main style={{padding:24}}>
    <h2>Query by Example (Paste JD/Ideal CV)</h2>
    <textarea style={{width:'100%',height:140}} value={text} onChange={e=>setText(e.target.value)} />
    <div><button onClick={run}>ابحث</button></div>
    <ol>{rows.map((r:any,i:number)=>(<li key={i}>{r.full_name} - score {(r.score||0).toFixed(3)}</li>))}</ol>
  </main>
}
