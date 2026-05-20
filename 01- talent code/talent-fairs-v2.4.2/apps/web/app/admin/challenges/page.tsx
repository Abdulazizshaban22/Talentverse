'use client'
import { useEffect, useState } from 'react'
export default function AdminChallenges(){
  const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
  const [list,setList]=useState<any[]>([])
  const [form,setForm]=useState({title:'',description:'',period:'weekly',tasks:''})
  async function load(){ const r=await fetch(API+'/challenges/list'); setList(await r.json()) }
  async function create(){
    const tasks=form.tasks.split(',').map(s=>({title:s.trim(),points:10})).filter(t=>t.title)
    await fetch(API+'/challenges/create',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title:form.title,description:form.description,period:form.period,tasks})})
    setForm({title:'',description:'',period:'weekly',tasks:''}); await load()
  }
  useEffect(()=>{ load() },[])
  return <main style={{padding:24}}>
    <h2>إدارة التحديات</h2>
    <div style={{display:'grid',gap:8,maxWidth:700}}>
      <input placeholder="العنوان" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
      <textarea placeholder="الوصف" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
      <select value={form.period} onChange={e=>setForm({...form,period:e.target.value})}>
        <option value="weekly">أسبوعي</option><option value="monthly">شهري</option>
      </select>
      <input placeholder="مهام (افصلها بفواصل)" value={form.tasks} onChange={e=>setForm({...form,tasks:e.target.value})}/>
      <div style={{display:'flex',gap:8}}><button onClick={create}>إنشاء</button><button onClick={load}>تحديث</button></div>
    </div>
    <h3 style={{marginTop:16}}>القائمة</h3>
    {list.map((c:any)=> <div key={c.id} style={{border:'1px solid #eee',padding:12,borderRadius:8,marginBottom:8}}>
      <b>{c.title}</b> — {c.period} — {c.tasks?.length||0} مهام
    </div>)}
  </main>
}
