
'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
export default function RankEval(){
  const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
  const [arr,setArr] = useState('3,2,3,0,1,2')
  const [ndcg,setVal] = useState(null)
  const [series,setSeries] = useState([])
  async function calc(){
    const relevances = arr.split(',').map(x=>parseInt(x.trim(),10)).filter(n=>!isNaN(n))
    const r = await fetch(API+'/api/rankeval/ndcg',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ relevances, k:10 }) })
    const j = await r.json(); setVal(j.ndcg)
  }
  useEffect(()=>{ fetch(API+'/api/rankeval/metrics').then(r=>r.json()).then(j=>setSeries(j.data||[])) },[])
  return (
    <main className="grid">
      <motion.div className="card" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
        <h2>RankEval — nDCG@10</h2>
        <p>أدخل قائمة التقيّمات (0..3) مفصولة بفواصل:</p>
        <input className="input" value={arr} onChange={e=>setArr(e.target.value)} />
        <button className="btn" style={{marginTop:8}} onClick={calc}>احسب</button>
        {ndcg!==null && <p>nDCG@10 = <b>{ndcg.toFixed(4)}</b></p>}
        <h3>Series</h3>
        <pre>{JSON.stringify(series.slice(-10),null,2)}</pre>
      </motion.div>
    </main>
  )
}
