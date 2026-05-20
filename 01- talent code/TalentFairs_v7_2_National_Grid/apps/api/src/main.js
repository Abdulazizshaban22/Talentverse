import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import http from 'http'

import { tenancy } from './tenancy_middleware.js'
import { socialFeed } from './social_feed_os.js'
import { search } from './search_os.js'
import { ltr } from './ltr_stubs.js'

const app = express()
const server = http.createServer(app)
app.use(cors())
app.use(bodyParser.json({limit:'2mb'}))

app.get('/health', (_req,res)=> res.json({ ok:true, service:'tf-api-7.2', ts: Date.now() }))

app.use(tenancy)         // Multi-tenant extraction
app.use('/social', socialFeed)
app.use('/search', search)
app.use('/rank', ltr)    // LTR admin/test

const PORT = process.env.PORT || 4000
server.listen(PORT, ()=> console.log('TalentFairs API 7.2 on http://localhost:'+PORT))
