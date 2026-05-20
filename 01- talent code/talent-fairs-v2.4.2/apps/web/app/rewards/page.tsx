'use client'
import { useEffect, useState } from 'react'
export default function Rewards(){
  const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
  const [list,setList]=useState<any[]>([])
  const [user,setUser]=useState('userA')
  const [form,setForm]=useState({title:'',points:50})
  async function load(){ const r=await fetch(API+'/rewards/list'); setList(await r.json()) }
  async function create(){ await fetch(API+'/rewards/create',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)}); setForm({title:'',points:50}); await load() }
  async function redeem(id:string){ await fetch(API+'/rewards/redeem',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({rewardId:id,userId:user})}); await load() }
  useEffect(()=>{ load() },[])
  return <main style={{padding:24,maxWidth:800,margin:'0 auto'}}>
    <h2>متجر المكافآت</h2>
    <div style={{display:'grid',gap:8,maxWidth:600}}>
      <input placeholder="اسم المكافأة" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
      <input type="number" placeholder="نقاط" value={form.points} onChange={e=>setForm({...form,points:Number(e.target.value)})}/>
      <button onClick={create}>إضافة مكافأة</button>
    </div>
    <h3 style={{marginTop:16}}>المتاح</h3>
    <div>{list.map((r:any)=> <div key={r.id} style={{border:'1px solid #eee',padding:12,borderRadius:8,marginBottom:8,display:'flex',justifyContent:'space-between'}}>
      <div><b>{r.title}</b> — {r.points} نقطة</div>
      <button onClick={()=>redeem(r.id)}>استبدال</button>
    </div>)}</div>
  </main>
}
