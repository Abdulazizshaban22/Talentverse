'use client'
import { useEffect, useState } from 'react'
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function Course({params}:{params:{id:string}}){
  const [course,setCourse]=useState<any>(null)
  useEffect(()=>{(async()=>{
    const r=await fetch(`${API}/lms/course/list`); const j=await r.json()
    setCourse((j.courses||[]).find((c:any)=>c.id===params.id))
  })()},[params.id])
  return <main style={{padding:24}}>
    <h1>الدورة</h1>
    {course ? (<div>
      <h2>{course.title}</h2>
      <p>{course.about}</p>
      <ol>{(course.lessons||[]).map((l:any)=><li key={l.id}>{l.title}</li>)}</ol>
    </div>) : <p>جاري التحميل…</p>}
  </main>
}
