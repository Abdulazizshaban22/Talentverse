
'use client'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { apiGet } from '../lib/api'
export default function Dashboard(){
  const { data: session } = useSession()
  const [info, setInfo] = useState<any>(null)
  useEffect(()=>{
    (async ()=>{
      if (session) {
        const r = await apiGet('v1/ping')
        setInfo(r)
      }
    })()
  },[session])
  if (!session) return <main style={{padding:24}}>الرجاء تسجيل الدخول</main>
  return <main style={{padding:24}}>
    <h2>لوحة التحكم</h2>
    <pre>{JSON.stringify(info, null, 2)}</pre>
  </main>
}
