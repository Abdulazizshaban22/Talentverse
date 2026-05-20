'use client'
import { useEffect, useState } from 'react'
export default function Bans(){
  const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
  const [list,setList]=useState<any[]>([])
  const [form,setForm]=useState({userId:'',minutes:60,reason:'policy'})
  async function load(){ const r=await fetch(API+'/admin/bans/list'); setList(await r.json()) }
  async function ban(){ await fetch(API+'/admin/bans/ban',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)}); setForm({userId:'',minutes:60,reason:'policy'}); await load() }
  async function unban(id:string){ await fetch(API+'/admin/bans/unban',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})}); await load() }
  useEffect(()=>{ load() },[])
  return <main style={{padding:24,maxWidth:900,margin:'0 auto'}}>
    <h2>سياسات الحظر</h2>
    <div style={{display:'grid',gap:8,maxWidth:500}}>
      <input placeholder="userId" value={form.userId} onChange={e=>setForm({...form,userId:e.target.value})}/>
      <input type="number" placeholder="minutes" value={form.minutes} onChange={e=>setForm({...form,minutes:Number(e.target.value)})}/>
      <input placeholder="reason" value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})}/>
      <button onClick={ban}>حظر مؤقت</button>
    </div>
    <h3 style={{marginTop:16}}>القائمة</h3>
    {list.map((b:any)=> <div key={b.id} style={{border:'1px solid #eee',padding:12,borderRadius:8,marginBottom:8,display:'flex',justifyContent:'space-between'}}>
      <div><b>{b.userId}</b> — حتى {new Date(b.until).toLocaleString()} — {b.reason}</div>
      <button onClick={()=>unban(b.id)}>إلغاء الحظر</button>
    </div>)}
  </main>
}
