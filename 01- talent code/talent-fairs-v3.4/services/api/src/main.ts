import express from 'express'
import http from 'http'

const app = express()
const server = http.createServer(app)
app.use(express.json())

// Mock explain endpoints (hook to Python SHAP in prod)
app.get('/explain/shap/summary', (_req,res)=> res.json({ ok:true, plot:'summary', topFeatures:[{name:'skill_match',impact:0.43},{name:'experience',impact:0.29}] }))
app.get('/explain/shap/force', (_req,res)=> res.json({ ok:true, plot:'force', contributions:[+0.21,-0.11,+0.07] }))

// Export PDF using Playwright
app.post('/export/pdf', async (_req,res)=>{
  const { chromium } = await import('playwright')
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setContent(`<html><body><h1>Explain Report</h1><p>SHAP summary/force snapshots.</p></body></html>`)
  const pdf = await page.pdf({ format:'A4' })
  await browser.close()
  res.setHeader('Content-Type','application/pdf')
  res.send(pdf)
})

server.listen(4000, ()=> console.log('API v3.4 listening on 4000'))
