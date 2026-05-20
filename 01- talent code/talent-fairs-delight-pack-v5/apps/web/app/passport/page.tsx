'use client'
import { useEffect, useState } from 'react'
function genQR(text:string){ return `https://chart.googleapis.com/chart?cht=qr&chs=240x240&chl=${encodeURIComponent(text)}` }
export default function TalentPassport(){
  const [profile, setProfile] = useState<any>(null)
  const [qr, setQr] = useState<string>('')
  useEffect(()=>{ (async()=>{
    try{ const r = await fetch('/profile/demo'); const dj = await r.json(); setProfile(dj.profile); setQr(genQR(`TF-Passport:${dj.profile?.id||'guest'}`)) }catch{ setProfile({id:'guest', name:'Guest User'}) }
  })() }, [])
  return <main style={{padding:24}}>
    <h1>Talent Passport</h1>
    <p>بطاقة مهارية ذكية (QR/NFC) — نموذج أولي.</p>
    {profile && <>
      <div style={{display:'flex', gap:24, alignItems:'center', marginTop:12}}>
        <div><div style={{fontSize:18, fontWeight:600}}>{profile.name}</div><div style={{opacity:0.7}}>ID: {profile.id}</div></div>
        {qr && <img src={qr} width={240} height={240} alt="QR" />}
      </div>
      <div style={{marginTop:16}}>
        <a href={'data:application/json,'+encodeURIComponent(JSON.stringify({passport:'demo', id: profile.id, name: profile.name}))} download={`talent-passport-${profile.id}.json`}>
          تنزيل بطاقة (JSON)
        </a>
      </div>
    </>}
  </main>
}
