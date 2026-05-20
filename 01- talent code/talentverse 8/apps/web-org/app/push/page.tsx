
'use client'
export default function PushPage(){
  async function enable(){
    const reg = await navigator.serviceWorker.register('/sw.js')
    const sub = await reg.pushManager.subscribe({ userVisibleOnly:true, applicationServerKey: '<VAPID_PUBLIC_KEY_BASE64>' })
    console.log('push sub', JSON.stringify(sub))
    alert('تم الاشتراك في الإشعارات (تجريبي)')
  }
  return <main style={{padding:24}}>
    <h2>إشعارات المتصفح</h2>
    <button onClick={enable}>تفعيل</button>
  </main>
}
