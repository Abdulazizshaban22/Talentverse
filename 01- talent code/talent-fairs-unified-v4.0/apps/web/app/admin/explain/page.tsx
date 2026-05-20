'use client'
import { useState } from 'react'
const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
export default function Explain(){
  const [out,setOut]=useState<any>(null)
  async function summary(){ const r=await fetch(API+'/explain/shap/summary'); setOut(await r.json()) }
  async function force(){ const r=await fetch(API+'/explain/shap/force'); setOut(await r.json()) }
  async function pdf(){ const r=await fetch(API+'/export/pdf',{method:'POST'}); const blob=await r.blob(); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='explain.pdf'; a.click() }
  return <main style={{padding:24}}>
    <h2>Explain‑Why</h2>
    <button onClick={summary}>ملخص SHAP</button>
    <button onClick={force} style={{marginInlineStart:8}}>Force Plot</button>
    <button onClick={pdf} style={{marginInlineStart:8}}>تصدير PDF</button>
    {out && <pre style={{whiteSpace:'pre-wrap',marginTop:12}}>{JSON.stringify(out,null,2)}</pre>}
  </main>
}
