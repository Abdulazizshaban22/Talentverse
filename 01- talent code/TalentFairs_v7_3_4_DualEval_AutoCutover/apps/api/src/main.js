
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import http from 'http'
import { admin } from './admin_routes.js'

const app = express()
const server = http.createServer(app)
app.use(cors())
app.use(bodyParser.json({limit:'2mb'}))

app.get('/health', (_req,res)=> res.json({ ok:true, service:'tf-admin-7.3.4', ts: Date.now() }))
app.use('/admin', admin)

const PORT = process.env.PORT || 4100
server.listen(PORT, ()=> console.log('Admin API 7.3.4 on http://localhost:'+PORT))
