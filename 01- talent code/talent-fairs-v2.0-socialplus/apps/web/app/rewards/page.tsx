'use client'
import useSWR from 'swr'
import { useSession, signIn } from 'next-auth/react'
export default function Rewards(){
  const { data: session } = useSession()
  const token = (session as any)?.accessToken
  const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
  const { data } = useSWR(token? ['/rewards','t'] : null, async()=>{
    const r = await fetch(API + '/rewards', { headers: { Authorization: `Bearer ${token}` } })
    return r.json()
  })
  if(!session) return <div style={{padding:32,textAlign:'center'}}><p>سجّل الدخول</p><button onClick={()=>signIn('keycloak')}>تسجيل الدخول</button></div>
  const redeem = async(id:string)=>{
    const r = await fetch(API + '/rewards/redeem', { method:'POST', headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` }, body: JSON.stringify({ userId:(session as any).sub, rewardId:id }) })
    alert((await r.json()).ok?'تم الاستبدال':'فشل')
  }
  return <main style={{maxWidth:820, margin:'0 auto', padding:24}}>{(data||[]).map((rw:any)=> <div key={rw.id} style={{border:'1px solid #eee',padding:16,borderRadius:8,display:'flex',justifyContent:'space-between',marginBottom:8}}><div><div style={{fontWeight:600}}>{rw.title}</div><div style={{fontSize:12,opacity:.7}}>نقاط: {rw.cost} — مخزون: {rw.stock}</div></div><button onClick={()=>redeem(rw.id)}>استبدال</button></div>)}</main>
}
