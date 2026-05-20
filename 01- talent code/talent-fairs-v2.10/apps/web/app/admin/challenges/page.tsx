'use client'
import { useEffect, useState } from 'react'
const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
export default function Challenges(){
  const [list,setList]=useState<any[]>([])
  const [f,setF]=useState<any>({title:'',points:50,description:''})
  async function load(){ const r=await fetch(API+'/admin/challenges'); setList(await r.json()) }
  async function add(){ await fetch(API+'/admin/challenges',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...f,points:Number(f.points)||0})}); setF({title:'',points:50,description:''}); await load() }
  async function del(id:string){ await fetch(API+'/admin/challenges/'+id,{method:'DELETE'}); await load() }
  useEffect(()=>{ load() },[])
  return <main style={{padding:24,maxWidth:900,margin:'0 auto'}}>
    <h2>التحديات</h2>
    <div style={{display:'grid',gap:8}}>
      <input placeholder="العنوان" value={f.title} onChange={e=>setF({...f,title:e.target.value})}/>
      <input placeholder="النقاط" type="number" value={f.points} onChange={e=>setF({...f,points:e.target.value})}/>
      <textarea placeholder="الوصف" value={f.description} onChange={e=>setF({...f,description:e.target.value})}/>
      <button onClick={add}>إضافة</button>
    </div>
    <h3 style={{marginTop:16}}>القائمة</h3>
    {list.map((j:any)=> <div key={j.id} style={{border:'1px solid #eee',padding:12,borderRadius:8,marginBottom:8}}>
      <b>{j.title}</b> — نقاط: {j.points}
      <button style={{marginInlineStart:12}} onClick={()=>del(j.id)}>حذف</button>
    </div>)}
  </main>
}
