'use client'
import { useEffect, useState, useRef } from 'react'

/**
 * Talent Passport AR
 * - Uses <model-viewer> for cross‑platform AR:
 *   • Android → Scene Viewer
 *   • iOS → Quick Look (USDZ via ios-src)
 *   • Fallback → WebGL viewer
 * - Awards loyalty points after AR session starts/ends
 */

declare global { namespace JSX { interface IntrinsicElements { 'model-viewer': any } } }

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export default function PassportAR() {
  const [modelUrl, setModelUrl] = useState('/models/passport.glb')
  const [usdzUrl, setUsdzUrl]   = useState('/models/passport.usdz')
  const [status, setStatus] = useState('ready')
  const mvRef = useRef<any>(null)

  useEffect(()=>{
    // optional dynamic model selection for a user
    // setModelUrl(`/api/asset/${userId}.glb`)
  }, [])

  async function award(eventType:string){
    try{
      await fetch(`${API}/loyalty/award`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ userId:'demo', event:eventType, points: eventType==='ar-start' ? 5 : 10 })
      })
    }catch{ /* ignore for demo */ }
  }

  function onARStatus(e:any){
    setStatus(e.detail.status)
    if(e.detail.status === 'session-started') award('ar-start')
    if(e.detail.status === 'not-presenting' || e.detail.status==='session-ended') award('ar-end')
  }

  return (
    <main style={{padding:24}}>
      <h1>Talent Passport — AR</h1>
      <p>استخدم وضع الواقع المعزّز لعرض بطاقة موهبتك ثلاثية الأبعاد.</p>

      <model-viewer
        ref={mvRef}
        src={modelUrl}
        ios-src={usdzUrl}
        ar ar-modes="webxr scene-viewer quick-look"
        camera-controls
        style={{width:'100%', maxWidth:720, height:480, border:'1px solid #eee', borderRadius:12}}
        on-ar-status={onARStatus}
        ar-scale="fixed"
        exposure="1.0">
      </model-viewer>

      <div style={{marginTop:12, opacity:0.7}}>الحالة: {status}</div>
      <p style={{marginTop:16}}>بعد نجاح التجربة، تُضاف نقاط الولاء تلقائيًا.</p>
    </main>
  )
}
