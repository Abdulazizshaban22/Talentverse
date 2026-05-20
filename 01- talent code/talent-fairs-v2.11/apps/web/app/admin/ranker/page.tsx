'use client'
import { useEffect, useState } from 'react'
const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
export default function Ranker(){
  const [w,setW]=useState<any>({wGraph:0.5,wLTR:0.5})
  async function load(){ const r=await fetch(API+'/ranker/weights'); setW(await r.json()) }
  async function save(){ await fetch(API+'/ranker/weights',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(w)}); await load() }
  async function simulate(){ await fetch(API+'/ranker/train',{method:'POST'}) }
  useEffect(()=>{ load() },[])
  return <main style={{padding:24,maxWidth:720,margin:'0 auto'}}>
    <h2>ضبط خوارزمية الترتيب (LTR)</h2>
    <div style={{display:'grid',gap:8,maxWidth:420}}>
      <label>وزن الرسم (Graph): <input type="number" min="0" max="1" step="0.05" value={w.wGraph} onChange={e=>setW({...w,wGraph:Number(e.target.value)||0})}/></label>
      <label>وزن LTR: <input type="number" min="0" max="1" step="0.05" value={w.wLTR} onChange={e=>setW({...w,wLTR:Number(e.target.value)||0})}/></label>
      <button onClick={save}>حفظ</button>
      <button onClick={simulate}>تدريب/محاكاة</button>
    </div>
    <p style={{opacity:.7,marginTop:8,fontSize:12}}>النسب تُطبَّق على `/recs/fusion` في الـAPI.</p>
  </main>
}
