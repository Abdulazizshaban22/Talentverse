
import express from 'express'
import fetch from 'node-fetch'
const app=express(); const API=process.env.NEXT_PUBLIC_API_BASE||'http://localhost:4000'
app.get('/',(_q,r)=>r.send('<h1>TalentFairs v9.0</h1><a href="/feed">Feed</a>'))
app.get('/feed', async (_q,r)=>{ const x=await (await fetch(API+'/api/feed/home')).json(); r.send('<h2>Feed</h2><pre>'+JSON.stringify(x,null,2)+'</pre>') })
const PORT=process.env.PORT||3000; app.listen(PORT,()=>console.log('WEB:'+PORT))
