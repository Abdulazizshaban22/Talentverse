
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import http from 'http'
import { tenancy } from './tenancy_middleware.js'
import { shadow } from './shadow_routes.js'

const app = express()
const server = http.createServer(app)
app.use(cors())
app.use(bodyParser.json({limit:'2mb'}))

app.get('/health', (_req,res)=> res.json({ ok:true, service:'tf-fusion-7.3.3', ts: Date.now() }))

app.use(tenancy)
app.use('/fusion/shadow', shadow)

const PORT = process.env.PORT || 4000
server.listen(PORT, ()=> console.log('Fusion API 7.3.3 on http://localhost:'+PORT))
