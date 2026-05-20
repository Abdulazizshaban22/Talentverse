'use client'
import { useState } from 'react'
import { useSession, signIn } from 'next-auth/react'

export default function SearchPage(){
  const { data: session } = useSession()
  const token = (session as any)?.accessToken
  const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
  const [q, setQ] = useState('')
  const [hits, setHits] = useState<any[]>([])
  async function doSearch(){
    const r = await fetch(`${API}/search?q=`+encodeURIComponent(q), { headers: { Authorization: `Bearer ${token}` } })
    const j = await r.json(); setHits(j.hits||[])
  }
  if(!session) return <div style={{padding:32, textAlign:'center'}}><p>سجّل الدخول</p><button onClick={()=>signIn('keycloak')}>تسجيل الدخول</button></div>
  return <main style={{maxWidth:820, margin:'0 auto', padding:24}}>
    <div style={{display:'flex', gap:8}}>
      <input style={{flex:1, padding:8, border:'1px solid #ddd'}} placeholder="ابحث بالعربية عن منشورات" value={q} onChange={e=>setQ(e.target.value)} />
      <button onClick={doSearch}>بحث</button>
    </div>
    <div style={{marginTop:16}}>
      {hits.map((h:any)=>(<div key={h.id} style={{border:'1px solid #eee', padding:12, borderRadius:8, marginBottom:8}}>
        <div style={{fontSize:12, opacity:.6}}>score: {h.score?.toFixed(3)}</div>
        <div>{h.source?.text}</div>
      </div>))}
    </div>
  </main>
}
