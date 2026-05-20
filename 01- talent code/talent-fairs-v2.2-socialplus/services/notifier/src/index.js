import { fetch } from 'undici'
const RESEND_KEY=process.env.RESEND_API_KEY||''
const WA_TOKEN=process.env.WHATSAPP_TOKEN||''
const WA_PHONE_ID=process.env.WHATSAPP_PHONE_NUMBER_ID||''
export async function sendEmail(to,subject,html){
  if(!RESEND_KEY) return {ok:false,error:'No RESEND_API_KEY'}
  const r=await fetch('https://api.resend.com/emails',{
    method:'POST',headers:{'Authorization':`Bearer ${RESEND_KEY}`,'Content-Type':'application/json'},
    body:JSON.stringify({from:'Talent Fairs <no-reply@talent.sa>',to,subject,html})
  }); return await r.json()
}
export async function sendWhatsApp(to,body){
  if(!WA_TOKEN||!WA_PHONE_ID) return {ok:false,error:'Missing WhatsApp config'}
  const url=`https://graph.facebook.com/v20.0/${WA_PHONE_ID}/messages`
  const r=await fetch(url,{method:'POST',headers:{'Authorization':`Bearer ${WA_TOKEN}`,'Content-Type':'application/json'},
    body:JSON.stringify({messaging_product:'whatsapp',to,type:'text',text:{body}})})
  return await r.json()
}
export async function expoPush(expoToken, title, body, data={}){
  const r = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type':'application/json' },
    body: JSON.stringify({ to: expoToken, title, body, data })
  })
  return await r.json()
}
