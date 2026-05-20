'use client'
import { useEffect, useState } from 'react'
export default function Realtime(){
  const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
  const [events,setEvents]=useState<string[]>([])
  useEffect(()=>{
    const ev = new EventSource(API.replace(/\/$/,'') + '/events/stream')
    ev.onmessage = (e)=> setEvents(prev=> [e.data, ...prev].slice(0,50))
    ev.onerror = ()=> ev.close()
    return ()=> ev.close()
  },[])
  return <main style={{padding:24,maxWidth:800,margin:'0 auto'}}>
    <h2>البث الحي للأحداث</h2>
    <ul>{events.map((t,i)=> <li key={i}>{t}</li>)}</ul>
  </main>
}
