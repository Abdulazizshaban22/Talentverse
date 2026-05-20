'use client'
import { useState } from 'react'
const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
export default function Guardian(){
  const [studentId,setStudentId]=useState('demo')
  const [out,setOut]=useState<any>(null)
  async function view(){ const r=await fetch(API+'/profile/'+studentId); setOut(await r.json()) }
  async function consent(){
    const r=await fetch(API+'/consents',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({studentId, purpose:'school_assessment', grant:true})})
    alert((await r.json()).msg||'ok')
  }
  return <main style={{padding:24,maxWidth:980,margin:'0 auto'}}>
    <h2>لوحة ولي الأمر</h2>
    <p>استعراض ملف الحياة ومنح/سحب الموافقات.</p>
    <div style={{display:'flex',gap:8}}>
      <input value={studentId} onChange={e=>setStudentId(e.target.value)} placeholder="Student ID"/>
      <button onClick={view}>عرض الملف</button>
      <button onClick={consent}>منح موافقة</button>
    </div>
    {out && <pre style={{whiteSpace:'pre-wrap', marginTop:16}}>{JSON.stringify(out,null,2)}</pre>}
  </main>
}
