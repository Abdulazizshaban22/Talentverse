import { Router } from 'express'
export const credentials = Router()

// Open Badges issuer stub (JSON-LD)
credentials.get('/openbadges/issuer', (_req,res)=>{
  res.json({
    "@context":"https://w3id.org/openbadges/v2",
    "type":"Issuer",
    "id":"https://talentfairs.sa/issuer",
    "name":"TalentFairs Issuer",
    "url":"https://talentfairs.sa",
    "email":"issuer@talentfairs.sa"
  })
})

credentials.get('/openbadges/badgeclass/:id', (req,res)=>{
  const { id } = req.params
  res.json({
    "@context":"https://w3id.org/openbadges/v2",
    "type":"BadgeClass",
    "id":`https://talentfairs.sa/badgeclass/${id}`,
    "name":`Skill Badge — ${id}`,
    "criteria":{"narrative":"Completed course and passed assessment"}
  })
})

credentials.post('/openbadges/assertion', (req,res)=>{
  const { badgeId, recipient } = req.body||{}
  if(!badgeId||!recipient) return res.status(400).json({ok:false})
  res.json({
    "@context":"https://w3id.org/openbadges/v2",
    "type":"Assertion",
    "id": f"https://talentfairs.sa/assertion/{badgeId}-{recipient}",
    "badge": `https://talentfairs.sa/badgeclass/${badgeId}`,
    "recipient": {"type":"email","hashed":False,"identity":recipient},
    "issuedOn": new Date().toISOString()
  })
})

// ESCO sync stub
credentials.post('/esco/import', (_req,res)=>{
  // TODO: download/import ESCO taxonomy into DB
  res.json({ ok:true, imported:true, skills: 1234 })
})

// Verifiable Credential template (W3C VC)
credentials.get('/vc/template', (_req,res)=>{
  res.json({
    "@context":["https://www.w3.org/2018/credentials/v1"],
    "type":["VerifiableCredential","TalentPassportCredential"],
    "issuer":"did:web:talentfairs.sa",
    "credentialSubject":{ "id":"did:key:z6Mk...", "skills":[{"id":"ESCO:123","name":"Data Analysis"}] }
  })
})
