'use client'
import { useState } from 'react'
export default function SchoolManager(){
  const [msg, setMsg] = useState('')
  const [file, setFile] = useState<File|null>(null)
  async function upload(){
    if(!file) return
    const fd = new FormData(); fd.append('file', file)
    const r = await fetch('http://localhost:4000/school/oneroster/upload', { method:'POST', body:fd })
    setMsg(r.ok? '✔ تم استيراد OneRoster' : '❌ خطأ في الاستيراد')
  }
  return <main style={{padding:24}}>
    <h1>School Manager (OneRoster)</h1>
    <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} />
    <button onClick={upload} style={{marginLeft:8}}>رفع</button>
    <div style={{marginTop:12}}>{msg}</div>
  </main>
}
