'use client'
import { useState } from 'react'
const API = process.env.NEXT_PUBLIC_API_BASE || ''
export default function WhatIf(){
  const [w, setW] = useState({ ltr: 0.6, graph: 0.4 })
  const [out, setOut] = useState<any>(null)
  async function run(){
    const r = await fetch((API||'') + '/ai/whatif',{method:'POST',headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ ltr_weight:w.ltr, graph_weight:w.graph, sample:[{id:'c1', ltr:0.72, graph:0.30},{id:'c2', ltr:0.60, graph:0.55},{id:'c3', ltr:0.45, graph:0.80}]})})
    setOut(await r.json())
  }
  return <main style={{padding:24}}>
    <h1>Explain — What‑If</h1>
    <div style={{display:'grid', gap:8, maxWidth:420}}>
      <label>LTR Weight: {w.ltr.toFixed(2)}</label>
      <input type="range" min={0} max={1} step={0.05} value={w.ltr} onChange={e=>setW(v=>({...v, ltr: parseFloat(e.target.value), graph: 1-parseFloat(e.target.value)}))}/>
      <label>Graph Weight: {w.graph.toFixed(2)}</label>
      <input type="range" min={0} max={1} step={0.05} value={w.graph} onChange={e=>setW(v=>({...v, graph: parseFloat(e.target.value), ltr: 1-parseFloat(e.target.value)}))}/>
    </div>
    <button onClick={run} style={{marginTop:12}}>حساب</button>
    {out && <pre style={{whiteSpace:'pre-wrap', marginTop:12}}>{JSON.stringify(out,null,2)}</pre>}
  </main>
}
