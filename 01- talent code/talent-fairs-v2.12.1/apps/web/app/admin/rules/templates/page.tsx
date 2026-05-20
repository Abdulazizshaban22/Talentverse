'use client'
import { useEffect, useState } from 'react'
const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
type Tpl = { key:string, name:string, sector:string, description:string }
export default function Templates(){
  const [items,setItems]=useState<Tpl[]>([])
  const [msg,setMsg]=useState('')
  async function load(){ const r=await fetch(API+'/admin/rules/templates'); setItems(await r.json()) }
  async function install(key:string){ 
    setMsg(''); 
    const r=await fetch(API+'/admin/rules/templates/install',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key})})
    const dj=await r.json(); setMsg(dj.ok? 'تم التثبيت ✅' : 'فشل التثبيت ❌')
  }
  useEffect(()=>{ load() },[])
  return <main style={{padding:24,maxWidth:980,margin:'0 auto'}}>
    <h2>قوالب قواعد الفرز القطاعية</h2>
    <p style={{opacity:.7}}>اختر قالبًا لتثبيته في قاعدة البيانات (يمكن تعديله لاحقًا).</p>
    {items.map(x=> <div key={x.key} style={{border:'1px solid #eee',padding:12,borderRadius:8,marginBottom:10}}>
      <b>{x.name}</b> — <small>{x.sector}</small>
      <p style={{margin:'6px 0'}}>{x.description}</p>
      <button onClick={()=>install(x.key)}>تثبيت القالب</button>
    </div>)}
    {msg && <p>{msg}</p>}
  </main>
}
