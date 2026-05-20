import { fetch } from 'undici'

const RESEND_API_KEY = process.env.RESEND_API_KEY || ''
export async function sendEmail(to, subject, html){
  if(!RESEND_API_KEY) return { ok:false, error:'No RESEND_API_KEY' }
  const r = await fetch('https://api.resend.com/emails', {
    method:'POST',
    headers:{'Authorization':`Bearer ${RESEND_API_KEY}`,'Content-Type':'application/json'},
    body: JSON.stringify({ from: 'Talent Fairs <no-reply@talent.sa>', to, subject, html })
  })
  return await r.json()
}
console.log('Notifier ready')
