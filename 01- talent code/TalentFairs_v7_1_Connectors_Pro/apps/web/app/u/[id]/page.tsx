'use client'
import { useEffect, useState } from 'react'
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
export default function Profile({params}:{params:{id:string}}){
  const [seal,setSeal]=useState<any>(null)
  const [badges,setBadges]=useState<any[]>([])
  useEffect(()=>{(async()=>{
    const s = await (await fetch(`${API}/identity/status`)).json(); setSeal(s)
    const b = await (await fetch(`${API}/identity/badges/list?userId=${params.id}`)).json(); setBadges(b.badges||[])
  })()},[params.id])
  return <main style={{padding:24}}>
    <h1>الملف — {params.id}</h1>
    <div style={{marginTop:8}}>
      {seal?.verifiedNafath ? <span style={{padding:'4px 8px',background:'#e6ffec',border:'1px solid #b2f5c0',borderRadius:6}}>✅ Nafath Verified</span> : <span style={{padding:'4px 8px',background:'#fffbe6',border:'1px solid #ffe58f',borderRadius:6}}>⌛ بانتظار التحقق من Nafath</span>}
    </div>
    <h3 style={{marginTop:16}}>الشارات (Open Badges)</h3>
    <ul>{badges.map((b,i)=>(<li key={i}>🏅 {b.title||b.badgeId} — {new Date(b.issuedOn).toLocaleDateString()}</li>))}</ul>
  </main>
}
