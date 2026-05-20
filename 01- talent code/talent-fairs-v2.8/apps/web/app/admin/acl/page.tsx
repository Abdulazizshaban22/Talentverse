'use client'
import { useEffect, useState } from 'react'
export default function ACL(){
  const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
  const [list,setList]=useState<any[]>([])
  const [form,setForm]=useState({channel:'',roles:'talent,recruiter,admin'})
  async function load(){ const r=await fetch(API+'/admin/acl/list'); setList(await r.json()) }
  async function save(){ await fetch(API+'/admin/acl/set',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({channel:form.channel, roles:form.roles.split(',').map(s=>s.trim())})}); setForm({channel:'',roles:'talent,recruiter,admin'}); await load() }
  useEffect(()=>{ load() },[])
  return <main style={{padding:24,maxWidth:900,margin:'0 auto'}}>
    <h2>قوائم التحكم في القنوات (ACL)</h2>
    <div style={{display:'grid',gap:8,maxWidth:500}}>
      <input placeholder="channel" value={form.channel} onChange={e=>setForm({...form,channel:e.target.value})}/>
      <input placeholder="roles comma separated" value={form.roles} onChange={e=>setForm({...form,roles:e.target.value})}/>
      <button onClick={save}>حفظ</button>
    </div>
    <h3 style={{marginTop:16}}>القائمة</h3>
    {list.map((b:any)=> <div key={b.channel} style={{border:'1px solid #eee',padding:12,borderRadius:8,marginBottom:8}}>
      <div><b>{b.channel}</b> — {b.roles.join(', ')}</div>
    </div>)}
  </main>
}
