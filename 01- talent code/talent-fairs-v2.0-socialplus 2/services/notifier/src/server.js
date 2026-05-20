import Fastify from 'fastify'
import { sendEmail, sendWhatsApp } from './index.js'
const app = Fastify()
app.get('/health', async()=>({ ok:true, service:'notifier' }))
app.post('/email', async (req,res)=>{
  const { to, subject, html } = req.body||{}
  const r = await sendEmail(to, subject, html||'<p>hi</p>')
  return r
})
app.post('/whatsapp', async (req,res)=>{
  const { to, body } = req.body||{}
  const r = await sendWhatsApp(to, body||'Hello from Talent Fairs')
  return r
})
const port = Number(process.env.PORT||4200)
app.listen({ port, host:'0.0.0.0' }, (err, addr)=>{
  if(err){ console.error(err); process.exit(1) }
  console.log('Notifier HTTP on', addr)
})
