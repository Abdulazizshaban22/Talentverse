
'use client'
import { useState } from 'react'
export default function RankEval(){
  const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
  const [arr,setArr] = useState('3,2,3,0,1,2')
  const [ndcg,setVal] = useState(null)
  async function calc(){
    const relevances = arr.split(',').map(x=>parseInt(x.trim(),10)).filter(n=>!isNaN(n))
    const r = await fetch(API+'/api/rankeval/ndcg',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ relevances, k:10 }) })
    const j = await r.json(); setVal(j.ndcg)
  }
  return (
    <main className="grid">
      <div className="card">
        <h2>RankEval — nDCG@10</h2>
        <p>أدخل قائمة التقيّمات (0..3) مفصولة بفواصل:</p>
        <input style={{width:'100%'}} value={arr} onChange={e=>setArr(e.target.value)} />
        <button onClick={calc} style={{marginTop:8}}>احسب</button>
        {ndcg!==null && <p>nDCG@10 = <b>{ndcg.toFixed(4)}</b></p>}
        <p className="muted">للاختبار ضد OpenSearch Rank Eval استخدم endpoint /api/rankeval/opensearch.</p>
      </div>
    </main>
  )
}
