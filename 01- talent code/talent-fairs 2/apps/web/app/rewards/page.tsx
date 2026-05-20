'use client'
import useSWR from 'swr'
import { useSession, signIn } from 'next-auth/react'

const fetcher = (url:string, token?:string)=> fetch(url, { headers: token? { Authorization: `Bearer ${token}` } : {} }).then(r=>r.json())

export default function Rewards(){
  const { data: session } = useSession()
  const token = (session as any)?.accessToken
  const { data } = useSWR(session ? ['/api/rewards','token'] : null, async ()=>{
    const res = await fetch(process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/rewards', { headers: { Authorization: `Bearer ${token}` }})
    return res.json()
  })

  if(!session) return <div className="p-8 text-center">
    <p>الرجاء تسجيل الدخول لعرض المتجر</p>
    <button className="underline" onClick={()=>signIn('keycloak')}>تسجيل الدخول</button>
  </div>

  const redeem = async (id:string)=>{
    const r = await fetch((process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000') + '/rewards/redeem', {
      method:'POST',
      headers:{ 'Content-Type':'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId: (session as any).user?.id || (session as any).sub, rewardId: id })
    })
    alert((await r.json()).ok ? 'تم الاستبدال' : 'فشل الاستبدال')
  }

  return <main className="max-w-2xl mx-auto p-8">
    <h1 className="text-2xl font-bold mb-6">متجر المكافآت</h1>
    <ul className="space-y-3">
      {(data || []).map((rw:any)=> <li key={rw.id} className="border p-4 rounded flex items-center justify-between">
        <div><div className="font-semibold">{rw.title}</div><div className="text-sm text-gray-600">نقاط مطلوبة: {rw.cost} — المتاح: {rw.stock}</div></div>
        <button className="underline" onClick={()=>redeem(rw.id)}>استبدال</button>
      </li>)}
    </ul>
  </main>
}
