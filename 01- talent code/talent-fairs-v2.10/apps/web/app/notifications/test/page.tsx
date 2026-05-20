'use client'
import { useState } from 'react'
const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
export default function NotifTest(){
  const [email,setEmail]=useState('you@example.com')
  const [phone,setPhone]=useState('9665XXXXXXXX')
  const [msg,setMsg]=useState('Hello from Talent Fairs')
  async function sendEmail(){ await fetch(API+'/notify/email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({to:email,subject:'Test',html:`<p>${msg}</p>`})}) }
  async function sendWa(){ await fetch(API+'/notify/whatsapp',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({to:phone,text:msg})}) }
  return <main style={{padding:24,maxWidth:720,margin:'0 auto'}}>
    <h2>اختبار التنبيهات</h2>
    <div style={{display:'grid',gap:8}}>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email"/>
      <button onClick={sendEmail}>إرسال بريد (Resend)</button>
      <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="رقم واتساب (E.164)"/>
      <button onClick={sendWa}>إرسال واتساب (Cloud API)</button>
    </div>
  </main>
}
