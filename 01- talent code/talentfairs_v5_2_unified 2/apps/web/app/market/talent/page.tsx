'use client'
import { useState } from 'react'
export default function TalentMarket(){
  const [skills, setSkills] = useState('python,design,math')
  const [resu, setResu] = useState<any>(null)
  async function run(){
    const r = await fetch('http://localhost:4000/scholarships/match?profileId=demo&skills='+encodeURIComponent(skills))
    setResu(await r.json())
  }
  return <main style={{padding:24}}>
    <h1>Talent Market</h1>
    <input style={{width:'100%',maxWidth:420}} value={skills} onChange={e=>setSkills(e.target.value)}/>
    <button onClick={run} style={{marginLeft:8}}>مطابقة</button>
    {resu && <pre style={{marginTop:12}}>{JSON.stringify(resu,null,2)}</pre>}
  </main>
}
