
import { Router } from 'express'
export const router = Router()

router.post('/openbadges/issue', (req,res)=>{
  const { recipient, badgeClass } = req.body
  const assertion = {
    '@context': 'https://w3id.org/openbadges/v2',
    type: 'Assertion',
    id: 'urn:uuid:' + Math.random().toString(36).slice(2),
    recipient: { type:'email', identity: recipient },
    badge: badgeClass,
    issuedOn: new Date().toISOString(),
    verification: { type: 'HostedBadge' }
  }
  res.json({ ok:true, assertion })
})

router.post('/europass/export', (req,res)=>{
  const { subject } = req.body
  const vc = {
    '@context': ['https://www.w3.org/ns/credentials/v2'],
    type: ['VerifiableCredential','EducationCredential'],
    issuer: 'did:web:talentfairs.sa',
    issuanceDate: new Date().toISOString(),
    credentialSubject: subject
  }
  res.json({ ok:true, credential: vc })
})
