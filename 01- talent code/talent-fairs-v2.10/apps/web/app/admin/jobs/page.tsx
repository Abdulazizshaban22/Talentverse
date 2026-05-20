'use client'
import { useEffect, useState } from 'react'
const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
export default function Jobs(){
  const [list,setList]=useState<any[]>([])
  const [f,setF]=useState<any>({title:'',company:'',location:'',applyUrl:'',description:''})
  async function load(){ const r=await fetch(API+'/admin/jobs'); setList(await r.json()) }
  async function add(){ await fetch(API+'/admin/jobs',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(f)}); setF({title:'',company:'',location:'',applyUrl:'',description:''}); await load() }
  async function del(id:string){ await fetch(API+'/admin/jobs/'+id,{method:'DELETE'}); await load() }
  useEffect(()=>{ load() },[])
  return <main style={{padding:24,maxWidth:900,margin:'0 auto'}}>
    <h2>الوظائف</h2>
    <div style={{display:'grid',gap:8}}>
      <input placeholder="المسمى" value={f.title} onChange={e=>setF({...f,title:e.target.value})}/>
      <input placeholder="الشركة" value={f.company} onChange={e=>setF({...f,company:e.target.value})}/>
      <input placeholder="الموقع" value={f.location} onChange={e=>setF({...f,location:e.target.value})}/>
      <input placeholder="رابط التقديم" value={f.applyUrl} onChange={e=>setF({...f,applyUrl:e.target.value})}/>
      <textarea placeholder="الوصف" value={f.description} onChange={e=>setF({...f,description:e.target.value})}/>
      <button onClick={add}>إضافة</button>
    </div>
    <h3 style={{marginTop:16}}>القائمة</h3>
    {list.map((j:any)=> <div key={j.id} style={{border:'1px solid #eee',padding:12,borderRadius:8,marginBottom:8}}>
      <b>{j.title}</b> — {j.company} — {j.location} — <a href={j.applyUrl} target="_blank">تقديم</a>
      <button style={{marginInlineStart:12}} onClick={()=>del(j.id)}>حذف</button>
    </div>)}
  </main>
}
