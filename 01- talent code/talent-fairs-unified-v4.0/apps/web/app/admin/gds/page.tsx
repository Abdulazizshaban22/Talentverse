'use client'
import { useState } from 'react'
const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
export default function GDS(){
  const [out,setOut]=useState<any>(null)
  const [rank,setRank]=useState<any>(null)
  async function ingest(){ const r=await fetch(API+'/gds/ingest',{method:'POST'}); setOut(await r.json()) }
  async function pagerank(){ const r=await fetch(API+'/gds/pagerank',{method:'POST'}); setRank(await r.json()) }
  return <main style={{padding:24}}>
    <h2>Neo4j GDS</h2>
    <div style={{display:'flex',gap:8}}>
      <button onClick={ingest}>إرسال Nodes/Edges</button>
      <button onClick={pagerank}>تشغيل PageRank</button>
    </div>
    {out && <><h3>Ingest</h3><pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(out,null,2)}</pre></>}
    {rank && <><h3>PageRank</h3><pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(rank,null,2)}</pre></>}
  </main>
}
