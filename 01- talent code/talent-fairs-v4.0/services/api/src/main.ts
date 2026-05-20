import express from 'express'
import http from 'http'
import fetch from 'node-fetch'
import { create } from 'xmlbuilder2'

const app = express()
const server = http.createServer(app)
app.use(express.json({limit:'3mb'}))

// ESCO skill search
app.get('/esco/search', async (req,res)=>{
  const q = String(req.query.q||'software')
  const base = process.env.ESCO_API||'https://ec.europa.eu/esco/api'
  const url = `${base}/search?language=en&q=${encodeURIComponent(q)}&type=skill`
  const r = await fetch(url); const dj = await r.json()
  res.json({ ok:true, total: dj.total, items: dj._embedded?.results?.slice(0,10)||[] })
})

// Europass minimal XML export (demo structure)
app.post('/europass/export', async (req,res)=>{
  const cv = req.body||{}
  const doc = create({ version:'1.0', encoding:'UTF-8' })
    .ele('Europass', { 'xsi:noNamespaceSchemaLocation':'europass-xml-schema-v3.xsd', xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' })
      .ele('DocumentInfo').ele('DocumentType').txt('ECV').up().up()
      .ele('Identification').ele('PersonName')
        .ele('FirstName').txt(cv.firstName||'').up()
        .ele('Surname').txt(cv.lastName||'').up()
      .up().up()
      .ele('WorkExperience').ele('Employer').txt(cv.employer||'').up().up()
    .up()
  const xml = doc.end({ prettyPrint:true })
  res.setHeader('Content-Type','application/xml')
  res.send(xml)
})

// HR-Open (HR-XML) minimal PositionOpening fragment
app.post('/hropen/position', async (req,res)=>{
  const p = req.body||{ title:'Software Engineer' }
  const doc = create({ version:'1.0', encoding:'UTF-8' })
    .ele('PositionOpening', { xmlns:'http://www.hr-xml.org/3' })
      .ele('PositionTitle').txt(p.title).up()
      .ele('OrganizationName').txt(p.org||'Org').up()
    .up()
  const xml = doc.end({ prettyPrint:true })
  res.setHeader('Content-Type','application/xml')
  res.send(xml)
})

server.listen(4000, ()=> console.log('API v4.0 listening on 4000'))
