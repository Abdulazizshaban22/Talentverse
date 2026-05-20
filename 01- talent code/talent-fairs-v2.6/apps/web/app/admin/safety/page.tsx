'use client'
import { useEffect, useState } from 'react'
export default function Safety(){
  const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
  const [flags,setFlags]=useState<any[]>([])
  useEffect(()=>{ fetch(API+'/admin/safety/list').then(r=>r.json()).then(setFlags) },[])
  return <main style={{padding:24,maxWidth:900,margin:'0 auto'}}>
    <h2>مركز سلامة المحتوى</h2>
    <div>{flags.map((f:any)=> <div key={f.id} style={{border:'1px solid #eee',padding:12,borderRadius:8,marginBottom:8}}>
      <div><b>{f.entityType}</b> — {f.entityId}</div>
      <div style={{fontSize:12,opacity:.7}}>severity: {f.severity}</div>
      <div>{f.reason}</div>
      <div style={{fontSize:12,opacity:.7}}>{new Date(f.createdAt).toLocaleString()}</div>
    </div>)}</div>
  </main>
}
