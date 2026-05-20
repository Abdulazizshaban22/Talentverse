'use client'
import { useState } from 'react'
const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
export default function Explain(){
  const [features,setFeatures]=useState('0.8,0.2,0.4')
  const [out,setOut]=useState<any>(null)
  async function run(){
    const r=await fetch(API+'/explain/ltr/shap',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({features: features.split(',').map(x=>Number(x.trim()))})})
    const dj=await r.json(); setOut(dj)
  }
  return <main style={{padding:24,maxWidth:820,margin:'0 auto'}}>
    <h2>Explain‑Why (SHAP)</h2>
    <p>أدخل متجه الميزات (مثال: <code>0.8,0.2,0.4</code>) واحصل على إسهام كل ميزة.</p>
    <div style={{display:'grid',gap:8}}>
      <input value={features} onChange={e=>setFeatures(e.target.value)} placeholder="comma-separated features"/>
      <button onClick={run}>تفسير</button>
    </div>
    {out && <pre style={{whiteSpace:'pre-wrap',marginTop:12}}>{JSON.stringify(out,null,2)}</pre>}
  </main>
}
