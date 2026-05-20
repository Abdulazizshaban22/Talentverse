'use client'
import { useState } from 'react'
const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
export default function SIS(){
  const [schoolsCsv,setSchoolsCsv]=useState('name\nElite School')
  const [classesCsv,setClassesCsv]=useState('name,school\nGrade 1A,Elite School')
  const [studentsCsv,setStudentsCsv]=useState('fullName,class\nSara Ali,Grade 1A\nOmar Saleh,Grade 1A')
  const [enrollCsv,setEnrollCsv]=useState('student,class\nSara Ali,Grade 1A\nOmar Saleh,Grade 1A')
  const [out,setOut]=useState<any>(null)
  async function importAll(){
    const r=await fetch(API+'/sis/oneroster/import',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({schoolsCsv,classesCsv,studentsCsv,enrollmentsCsv:enrollCsv})})
    const dj=await r.json(); setOut(dj)
  }
  return <main style={{padding:24,maxWidth:980,margin:'0 auto'}}>
    <h2>OneRoster CSV — استيراد مبسّط</h2>
    <p>ألصق CSV للمدارس/الفصول/الطلاب/التسجيلات.</p>
    <div style={{display:'grid',gap:8}}>
      <label>Schools CSV</label><textarea rows={4} value={schoolsCsv} onChange={e=>setSchoolsCsv(e.target.value)}/>
      <label>Classes CSV</label><textarea rows={4} value={classesCsv} onChange={e=>setClassesCsv(e.target.value)}/>
      <label>Students CSV</label><textarea rows={6} value={studentsCsv} onChange={e=>setStudentsCsv(e.target.value)}/>
      <label>Enrollments CSV</label><textarea rows={4} value={enrollCsv} onChange={e=>setEnrollCsv(e.target.value)}/>
      <button onClick={importAll}>استيراد</button>
    </div>
    {out && <pre style={{whiteSpace:'pre-wrap',marginTop:12}}>{JSON.stringify(out,null,2)}</pre>}
  </main>
}
