'use client'
import { useState } from 'react'
const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
export default function OneRoster(){
  const [schools,setSchools]=useState('name
Elite School')
  const [classes,setClasses]=useState('sourcedId,schoolSourcedId,title
c1,s1,Grade 1A')
  const [users,setUsers]=useState('sourcedId,role,givenName,familyName
u1,teacher,Sara,Ali')
  const [enroll,setEnroll]=useState('classSourcedId,userSourcedId,role
c1,u1,teacher')
  const [out,setOut]=useState<any>(null)
  async function importCsv(){
    const r=await fetch(API+'/oneroster/import/csv',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({schools,classes,users,enrollments:enroll})})
    setOut(await r.json())
  }
  async function syncRest(){
    const r=await fetch(API+'/oneroster/sync/rest',{method:'POST'}); setOut(await r.json())
  }
  return <main style={{padding:24}}>
    <h2>OneRoster 1.2</h2>
    <p>CSV + REST (تجريبي).</p>
    <button onClick={importCsv}>استيراد CSV</button>
    <button onClick={syncRest} style={{marginInlineStart:8}}>مزامنة REST</button>
    {out && <pre style={{whiteSpace:'pre-wrap',marginTop:12}}>{JSON.stringify(out,null,2)}</pre>}
  </main>
}
