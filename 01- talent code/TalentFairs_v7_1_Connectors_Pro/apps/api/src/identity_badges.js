import { Router } from 'express'
export const identity = Router()

// Simple Nafath seal check from token claims (reverse proxy injects decoded claims in headers or middleware populates req.user)
identity.get('/status', (req,res)=>{
  // Expect header 'x-idp' = 'nafath' or JWT claim handled by your auth middleware
  const idp = (req.headers['x-idp'] || '').toString().toLowerCase()
  const verified = (idp === 'nafath')
  res.json({ ok:true, verifiedNafath: verified })
})

// Demo in-memory badges store
const badgesByUser = new Map() // userId -> [badge]
identity.post('/badges/issue', (req,res)=>{
  const { userId, badgeId, title } = req.body||{}
  if(!userId||!badgeId) return res.status(400).json({ok:false})
  const list = badgesByUser.get(userId) || []
  list.push({ badgeId, title, issuedOn: new Date().toISOString() })
  badgesByUser.set(userId, list)
  res.json({ ok:true, count: list.length })
})
identity.get('/badges/list', (req,res)=>{
  const userId = String(req.query.userId||'demo')
  res.json({ ok:true, badges: badgesByUser.get(userId)||[] })
})
