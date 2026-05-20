'use client'
import { useEffect, useState } from 'react'
const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
export default function Consents(){
  const [items,setItems]=useState<any[]>([])
  async function load(){ const r=await fetch(API+'/consents'); setItems(await r.json()) }
  useEffect(()=>{ load() },[])
  return <main style={{padding:24}}>
    <h2>الموافقات — PDPL</h2>
    <p>سجل موافقات أولياء الأمور والطلاب (عند بلوغ سن الرشد).</p>
    <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(items,null,2)}</pre>
  </main>
}
