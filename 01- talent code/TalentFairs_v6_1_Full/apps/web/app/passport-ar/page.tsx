'use client'
import { useEffect, useState, useRef } from 'react'

declare global { namespace JSX { interface IntrinsicElements { 'model-viewer': any } } }

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function PassportAR(){
  const [status, setStatus] = useState('ready')
  const mvRef = useRef<any>(null)

  async function award(eventType:string){
    try{
      await fetch(`${API}/loyalty/award`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ userId:'demo', event:eventType, points: eventType==='ar-start' ? 5 : 10 })
      })
    }catch{}
  }

  function onARStatus(e:any){
    setStatus(e.detail.status)
    if(e.detail.status==='session-started') award('ar-start')
    if(['not-presenting','session-ended'].includes(e.detail.status)) award('ar-end')
  }

  return <main style={{padding:24}}>
    <h1>Talent Passport — AR</h1>
    <p>عرض الجواز ثلاثي الأبعاد وتفعيل نقاط الولاء.</p>

    <script async src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"></script>
    <model-viewer
      ref={mvRef}
      src="/models/passport.glb"
      ios-src="/models/passport.usdz"
      ar ar-modes="webxr scene-viewer quick-look"
      camera-controls
      style={{width:'100%', maxWidth:720, height:480, border:'1px solid #eee', borderRadius:12}}
      on-ar-status={onARStatus}
      ar-scale="fixed"
      exposure="1.0">
    </model-viewer>

    <div style={{marginTop:12}}>الحالة: {status}</div>
  </main>
}
