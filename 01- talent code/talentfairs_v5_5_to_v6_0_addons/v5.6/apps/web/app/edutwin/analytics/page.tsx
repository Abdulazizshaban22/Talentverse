'use client'
import { useEffect, useState } from 'react'
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
export default function EduTwinAnalytics(){
  const [score, setScore] = useState<any>(null)
  useEffect(()=>{ (async()=>{
    const r = await fetch(`${API}/edutwin/metrics/engagement?learnerId=demo`)
    setScore(await r.json())
  })() },[])
  return <main style={{padding:24}}>
    <h1>EduTwin — Analytics</h1>
    <p>ملخص مؤشرات الذكاء الاجتماعي/المعرفي (تجريبي).</p>
    {score && <div style={{padding:16, border:'1px solid #eee', borderRadius:8}}>
      <div>Engagement: <b>{score.score}</b></div>
    </div>}
  </main>
}
