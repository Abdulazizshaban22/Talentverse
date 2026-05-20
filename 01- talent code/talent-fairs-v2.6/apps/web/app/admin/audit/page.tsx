'use client'
import { useEffect, useState } from 'react'
export default function Audit(){
  const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
  const [rows,setRows]=useState<any[]>([])
  useEffect(()=>{ fetch(API+'/admin/audit/list').then(r=>r.json()).then(setRows) },[])
  return <main style={{padding:24,maxWidth:900,margin:'0 auto'}}>
    <h2>سجل التدقيق</h2>
    <table style={{width:'100%',borderCollapse:'collapse'}}>
      <thead><tr><th>الزمن</th><th>المستخدم</th><th>العملية</th><th>بيانات</th></tr></thead>
      <tbody>
        {rows.map((r:any)=>(
          <tr key={r.id}>
            <td>{new Date(r.createdAt).toLocaleString()}</td>
            <td>{r.actorId}</td>
            <td>{r.action}</td>
            <td><pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(r.data||{},null,2)}</pre></td>
          </tr>
        ))}
      </tbody>
    </table>
  </main>
}
