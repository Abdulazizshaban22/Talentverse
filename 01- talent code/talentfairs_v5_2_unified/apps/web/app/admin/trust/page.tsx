'use client'
import { useEffect, useState } from 'react'
export default function TrustSafety(){
  const [reports, setReports] = useState<any[]>([])
  useEffect(()=>{ (async()=>{ const r=await fetch('http://localhost:4000/trust/reports'); setReports((await r.json()).reports||[]) })() },[])
  return <main style={{padding:24}}>
    <h1>Trust & Safety — Moderation</h1>
    {reports.map(r=>(
      <div key={r.id} style={{border:'1px solid #eee',padding:12, borderRadius:8, margin:'8px 0'}}>
        <div>Report #{r.id} — type: {r.type} — target: {r.targetId}</div>
        <pre>{JSON.stringify(r.payload,null,2)}</pre>
      </div>
    ))}
  </main>
}
