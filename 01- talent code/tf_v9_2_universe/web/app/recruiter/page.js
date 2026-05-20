
'use client'
import { useEffect, useState } from 'react'
export default function Recruiter(){
  const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
  const [tab,setTab] = useState('jobs')
  const [jobs,setJobs] = useState([])
  const [cands,setCands] = useState([])
  const [jobId,setJobId] = useState('')

  useEffect(()=>{
    fetch(API+'/api/recruiter/jobs').then(r=>r.json()).then(setJobs)
  },[])

  async function findMatch(){
    const r = await fetch(API+'/api/recruiter/match?jobId='+jobId)
    const j = await r.json()
    setCands(j.candidates||[])
  }

  return (
    <main className="grid">
      <div className="card">
        <h2>Recruiter Console</h2>
        <nav>
          <button onClick={()=>setTab('jobs')}>الوظائف</button>
          <button onClick={()=>setTab('applicants')}>المتقدمون</button>
          <button onClick={()=>setTab('match')}>التطابق الذكي</button>
          <button onClick={()=>setTab('analytics')}>الإحصاءات</button>
        </nav>

        {tab==='jobs' && <section><pre>{JSON.stringify(jobs,null,2)}</pre></section>}
        {tab==='match' && <section>
          <input placeholder="Job ID" value={jobId} onChange={e=>setJobId(e.target.value)} />
          <button onClick={findMatch}>ابحث عن مرشحين</button>
          <pre>{JSON.stringify(cands,null,2)}</pre>
        </section>}
        {tab==='analytics' && <section><p className="muted">قريبًا: time-to-hire / acceptance / sources</p></section>}
        {tab==='applicants' && <section><p className="muted">إدارة المتقدمين — قريبًا</p></section>}
      </div>
    </main>
  )
}
