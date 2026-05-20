'use client'
import { useState } from 'react'
const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
export default function Fusion(){
  const [csv,setCsv]=useState('qid,label,s_graph,s_ltr\n1,1,0.72,0.83\n1,0,0.65,0.31\n1,0,0.12,0.27\n2,1,0.44,0.91\n2,0,0.23,0.33')
  const [res,setRes]=useState<any>(null)
  async function autotune(){
    const r=await fetch(API+'/ranker/fusion/autotune',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({csv})})
    const dj=await r.json(); setRes(dj)
  }
  return <main style={{padding:24,maxWidth:820,margin:'0 auto'}}>
    <h2>Fusion (Graph + LTR) — Auto‑Tune</h2>
    <p>الصيغة: <code>qid,label,s_graph,s_ltr</code> — نبحث عن أفضل <b>alpha</b> يحقق أعلى NDCG@5.</p>
    <textarea rows={12} value={csv} onChange={e=>setCsv(e.target.value)} style={{width:'100%'}}/>
    <div style={{display:'flex',gap:8,marginTop:8}}>
      <button onClick={autotune}>تشغيل Auto‑Tune</button>
    </div>
    {res && <pre style={{whiteSpace:'pre-wrap',marginTop:12}}>{JSON.stringify(res,null,2)}</pre>}
  </main>
}
