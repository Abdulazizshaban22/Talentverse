'use client'
import { useState } from 'react'
const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
export default function Dataset(){
  const [csv,setCsv]=useState('qid,label,f1,f2,f3\n1,1,0.8,0.2,0.4\n1,0,0.6,0.1,0.2\n2,1,0.1,0.9,0.7')
  const [res,setRes]=useState<any>(null)
  const [fileName,setFileName]=useState('')
  async function ingest(text:string){
    const r=await fetch(API+'/ranker/dataset/ingest',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({csv:text})})
    const dj=await r.json(); setRes(dj)
  }
  return <main style={{padding:24,maxWidth:980,margin:'0 auto'}}>
    <h2>Dataset — CSV → JSONL</h2>
    <p style={{opacity:.7}}>صيغة الأعمدة: <code>qid,label,f1,f2,...</code> — كل <b>qid</b> تمثل مجموعة استعلام لــ LambdaRank.</p>
    <textarea rows={12} value={csv} onChange={e=>setCsv(e.target.value)} style={{width:'100%'}}/>
    <div style={{display:'flex',gap:8,marginTop:8}}>
      <button onClick={()=>ingest(csv)}>تحويل CSV إلى JSONL</button>
      <input type="file" onChange={async e=>{
        const f=e.target.files?.[0]; if(!f) return;
        setFileName(f.name); const t=await f.text(); setCsv(t)
      }} />
    </div>
    {fileName && <p>ملف: {fileName}</p>}
    {res && <pre style={{whiteSpace:'pre-wrap',marginTop:12}}>{JSON.stringify(res,null,2)}</pre>}
  </main>
}
