
'use client'
import useSWR from 'swr'
import { useSession } from 'next-auth/react'
import axios from 'axios'
const fetcher = (url:string, token:string)=> axios.get(url, { headers: { Authorization: `Bearer ${token}`}}).then(r=>r.data)
export default function Dashboard(){
  const { data: session } = useSession()
  if (!session) return <p style={{padding:24}}>الرجاء تسجيل الدخول</p>
  const token = (session as any)?.access_token || (session as any)?.id_token
  const { data } = useSWR(token ? ['/api/me', token] : null, ([,t])=>fetcher(process.env.API_BASE+'/v1/ping', t))
  return <main style={{padding:24}}>
    <h2>لوحة التحكم</h2>
    <pre>{JSON.stringify(data, null, 2)}</pre>
  </main>
}
