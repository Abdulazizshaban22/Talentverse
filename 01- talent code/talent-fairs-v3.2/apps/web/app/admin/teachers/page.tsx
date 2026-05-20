'use client'
import { useEffect, useState } from 'react'
const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
export default function Teachers(){
  const [items,setItems]=useState<any[]>([])
  useEffect(()=>{(async()=>{const r=await fetch(API+'/teachers'); setItems(await r.json())})()},[])
  return <main style={{padding:24}}><h2>المعلّمون</h2>
    <pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(items,null,2)}</pre>
  </main>
}
