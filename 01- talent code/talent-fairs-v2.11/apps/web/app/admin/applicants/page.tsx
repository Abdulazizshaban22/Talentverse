'use client'
import { useEffect, useState } from 'react'
const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
export default function Applicants(){
  const [rows,setRows]=useState<any[]>([])
  const [sel,setSel]=useState<any>(null)
  async function load(){ const r=await fetch(API+'/admin/applicants'); setRows(await r.json()) }
  async function setStatus(id:string, status:string){ await fetch(API+'/admin/applicants/'+id+'/status',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})}); await load() }
  async function reviewSave(){
    if(!sel) return
    await fetch(API+'/admin/applicants/'+sel.id+'/review',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(sel.review)})
    setSel(null); await load()
  }
  useEffect(()=>{ load() },[])
  return <main style={{padding:24,maxWidth:980,margin:'0 auto'}}>
    <h2>المتقدمون</h2>
    {rows.map((a:any)=> <div key={a.id} style={{border:'1px solid #eee',padding:12,borderRadius:8,marginBottom:8}}>
      <b>{a.user?.email}</b> — {a.job?.title} — الحالة: <code>{a.status}</code>
      <button style={{marginInlineStart:8}} onClick={()=>setStatus(a.id,'screening')}>بدء التقييم</button>
      <button style={{marginInlineStart:8}} onClick={()=>setStatus(a.id,'accepted')}>قبول</button>
      <button style={{marginInlineStart:8}} onClick={()=>setStatus(a.id,'rejected')}>رفض</button>
      <button style={{marginInlineStart:8}} onClick={()=>setSel({id:a.id, review: a.review||{skills:0,experience:0,culture:0,notes:''}})}>تقييم</button>
      {!!a.review && <span style={{marginInlineStart:8}}>— مجموع: {(a.review.skills+a.review.experience+a.review.culture)}</span>}
    </div>)}
    {sel && <div style={{marginTop:16,border:'1px solid #ddd',padding:12,borderRadius:8}}>
      <h3>تقييم المتقدم</h3>
      <div style={{display:'grid',gap:6,maxWidth:420}}>
        <label>مهارات: <input type="number" value={sel.review.skills} onChange={e=>setSel({ ...sel, review:{...sel.review, skills:Number(e.target.value)||0}})} /></label>
        <label>خبرة: <input type="number" value={sel.review.experience} onChange={e=>setSel({ ...sel, review:{...sel.review, experience:Number(e.target.value)||0}})} /></label>
        <label>ملائمة ثقافية: <input type="number" value={sel.review.culture} onChange={e=>setSel({ ...sel, review:{...sel.review, culture:Number(e.target.value)||0}})} /></label>
        <textarea placeholder="ملاحظات" value={sel.review.notes} onChange={e=>setSel({ ...sel, review:{...sel.review, notes:e.target.value}})} />
        <button onClick={reviewSave}>حفظ التقييم</button>
      </div>
    </div>}
  </main>
}
