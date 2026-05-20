'use client'
import { useEffect, useState } from 'react'
export default function AdminJobs(){
  const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
  const [list,setList]=useState<any[]>([])
  const [form,setForm]=useState({title:'',company:'',description:'',skills:''})
  async function load(){ const r=await fetch(API+'/admin/jobs'); setList(await r.json()) }
  async function create(){
    const payload={...form, skills: form.skills.split(',').map(s=>s.trim()).filter(Boolean)}
    await fetch(API+'/jobs/create',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})
    setForm({title:'',company:'',description:'',skills:''}); await load()
  }
  useEffect(()=>{ load() },[])
  return <main style={{padding:24}}>
    <h2>إدارة الوظائف</h2>
    <div style={{display:'grid',gap:8,maxWidth:700}}>
      <input placeholder="المسمى" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
      <input placeholder="الشركة" value={form.company} onChange={e=>setForm({...form,company:e.target.value})}/>
      <textarea placeholder="الوصف" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
      <input placeholder="مهارات (مفصولة بفواصل)" value={form.skills} onChange={e=>setForm({...form,skills:e.target.value})}/>
      <div style={{display:'flex',gap:8}}><button onClick={create}>إنشاء</button><button onClick={load}>تحديث</button></div>
    </div>
    <h3 style={{marginTop:16}}>القائمة</h3>
    {list.map((j:any)=> <div key={j.id} style={{border:'1px solid #eee',padding:12,borderRadius:8,marginBottom:8}}>
      <b>{j.title}</b> — {j.company}
    </div>)}
  </main>
}
