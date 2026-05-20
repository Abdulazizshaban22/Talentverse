
'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
export default function Recruiter(){
  const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
  const [tab,setTab] = useState('jobs')
  const [jobs,setJobs] = useState([])
  const [cands,setCands] = useState([])
  const [jobId,setJobId] = useState('')

  useEffect(()=>{ fetch(API+'/api/recruiter/jobs').then(r=>r.json()).then(setJobs) },[])
  async function findMatch(){
    const r = await fetch(API+'/api/recruiter/match?jobId='+jobId)
    const j = await r.json(); setCands(j.candidates||[])
  }

  return (
    <main className="grid">
      <motion.div className="card" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}>
        <h2>Recruiter Console</h2>
        <nav style={{gap:8}}>
          <button className="btn" onClick={()=>setTab('jobs')}>الوظائف</button>
          <button className="btn" onClick={()=>setTab('applicants')}>المتقدمون</button>
          <button className="btn" onClick={()=>setTab('match')}>التطابق الذكي</button>
          <button className="btn" onClick={()=>setTab('analytics')}>الإحصاءات</button>
        </nav>

        {tab==='jobs' && <section style={{marginTop:12}}><pre>{JSON.stringify(jobs,null,2)}</pre></section>}
        {tab==='match' && <section style={{marginTop:12}}>
          <input className="input" placeholder="Job ID" value={jobId} onChange={e=>setJobId(e.target.value)} />
          <button className="btn" style={{marginTop:8}} onClick={findMatch}>ابحث عن مرشحين</button>
          <pre>{JSON.stringify(cands,null,2)}</pre>
        </section>}
        {tab==='analytics' && <section style={{marginTop:12}}><p className="muted">time-to-hire / acceptance / sources — قريبًا</p></section>}
        {tab==='applicants' && <section style={{marginTop:12}}><p className="muted">إدارة المتقدمين — قريبًا</p></section>}
      </motion.div>
    </main>
  )
}
