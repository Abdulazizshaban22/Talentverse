'use client'
import { useEffect, useState } from 'react'
const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
export default function School(){
  const [stats,setStats]=useState<any>(null)
  const [name,setName]=useState('مدرسة النخبة الأهلية')
  const [grade,setGrade]=useState('Grade 1A')
  const [studentName,setStudentName]=useState('طالب تجريبي')
  const [scores,setScores]=useState({linguistic:3,logical:4,social:3,art:2,kinesthetic:3,spatial:2,digital:4,self:3})
  async function load(){ const r=await fetch(API+'/school/stats'); setStats(await r.json()) }
  async function createAssessment(){
    const r=await fetch(API+'/assessments',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({school:name,className:grade,studentName,scores})})
    alert((await r.json()).msg||'ok')
    load()
  }
  useEffect(()=>{ load() },[])
  return <main style={{padding:24,maxWidth:980,margin:'0 auto'}}>
    <h2>لوحة المدارس</h2>
    <p style={{opacity:.7}}>سجّل تقييمًا سريعًا (سنوي/فصلي) للطالب.</p>
    <div style={{display:'grid', gap:8, maxWidth:520}}>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="اسم المدرسة"/>
      <input value={grade} onChange={e=>setGrade(e.target.value)} placeholder="الفصل/الصف"/>
      <input value={studentName} onChange={e=>setStudentName(e.target.value)} placeholder="اسم الطالب"/>
      <label>درجات أولية (1–5):</label>
      {Object.keys(scores).map(k=>(
        <div key={k} style={{display:'flex',alignItems:'center',gap:8}}>
          <span style={{width:140}}>{k}</span>
          <input type="number" min={1} max={5} value={(scores as any)[k]}
            onChange={e=> setScores(s=>({...s,[k]: Number(e.target.value) }))}/>
        </div>
      ))}
      <button onClick={createAssessment}>حفظ التقييم</button>
    </div>
    {stats && <pre style={{whiteSpace:'pre-wrap', marginTop:16}}>{JSON.stringify(stats,null,2)}</pre>}
  </main>
}
