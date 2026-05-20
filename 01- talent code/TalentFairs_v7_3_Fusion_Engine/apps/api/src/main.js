import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import http from 'http'
import { tenancy } from './tenancy_middleware.js'
import { fusion } from './fusion_routes.js'

const app = express()
const server = http.createServer(app)
app.use(cors())
app.use(bodyParser.json({limit:'2mb'}))

app.get('/health', (_req,res)=> res.json({ ok:true, service:'tf-fusion-7.3', ts: Date.now() }))

app.use(tenancy)
app.use('/fusion', fusion)

const PORT = process.env.PORT || 4000
server.listen(PORT, ()=> console.log('Fusion API running on http://localhost:'+PORT))
