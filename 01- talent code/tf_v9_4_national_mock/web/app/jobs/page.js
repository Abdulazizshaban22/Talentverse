
'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
export default function Jobs(){
  const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
  const [jobs,setJobs] = useState([])
  useEffect(()=>{ fetch(API+'/api/recruiter/jobs').then(r=>r.json()).then(setJobs) },[])
  return (
    <main className="grid">
      <div className="card"><h2>الوظائف</h2>
        <div className="list">
          {jobs.map((j,i)=> (
            <motion.div key={j.id||i} className="item" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}>
              <div><b>{j.title||'—'}</b><div className="muted">{j.company||'—'}</div></div>
              <div style={{maxWidth:520}}>{(j.skills||[]).join(' • ')}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  )
}
