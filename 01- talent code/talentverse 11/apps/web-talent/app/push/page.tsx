
'use client'
export default function PushPage(){
  async function enable(){
    const reg = await navigator.serviceWorker.register('/sw.js')
    const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
    const sub = await reg.pushManager.subscribe({ userVisibleOnly:true, applicationServerKey: vapid })
    alert('تم الاشتراك. ارسل هذا الاشتراك إلى الخادم لتخزينه.')
    console.log('subscription', JSON.stringify(sub))
  }
  return <main style={{padding:24}}>
    <h2>إشعارات المتصفح</h2>
    <button onClick={enable}>تفعيل</button>
  </main>
}
