'use client'
import useSWR from 'swr'
import { useSession, signIn } from 'next-auth/react'
import { useState } from 'react'

export default function Social(){
  const { data: session } = useSession()
  const token = (session as any)?.accessToken
  const userId = (session as any)?.sub
  const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
  const fetcher = (u:string)=> fetch(u, { headers: token? { Authorization: `Bearer ${token}` } : {} }).then(r=>r.json())
  const { data: posts, mutate } = useSWR(token? ['/feed','t']: null, ()=> fetcher(`${API}/feed?userId=${userId}`))
  const [text, setText] = useState('')
  async function create(){ await fetch(`${API}/posts/create`, { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify({ text }) }); setText(''); mutate() }
  if(!session) return <div style={{padding:32,textAlign:'center'}}><p>سجّل الدخول لبدء النشر</p><button onClick={()=>signIn('keycloak')}>تسجيل الدخول</button></div>
  return <main style={{maxWidth:820, margin:'0 auto', padding:24}}>
    <div style={{border:'1px solid #eee', padding:12, borderRadius:8, marginBottom:16}}>
      <textarea style={{width:'100%',minHeight:90}} value={text} onChange={e=>setText(e.target.value)} placeholder="اكتب منشورًا..." />
      <div style={{marginTop:8}}><button onClick={create}>نشر</button></div>
    </div>
    <div>{(posts||[]).map((p:any)=>(
      <div key={p.id} style={{border:'1px solid #eee',padding:16,borderRadius:8,marginBottom:12}}>
        <div style={{fontSize:12,opacity:.6}}>{new Date(p.createdAt).toLocaleString()}</div>
        <div style={{marginTop:8,whiteSpace:'pre-wrap'}}>{p.text}</div>
        <div style={{fontSize:12,opacity:.6,marginTop:6}}>❤️ {p._count?.likes||0} · 💬 {p._count?.comments||0}</div>
      </div>
    ))}</div>
  </main>
}
