
import express from 'express'
const app = express()
app.get('/health', (_req,res)=>res.json({ ok:true, service:'api', ts: Date.now() }))
const PORT = process.env.PORT || 4000
app.listen(PORT, ()=> console.log('API on :' + PORT))
