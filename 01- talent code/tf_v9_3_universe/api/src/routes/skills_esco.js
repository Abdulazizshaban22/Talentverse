
import { Router } from 'express'
export const router = Router()

const ESCO = {"skills": [{"code": "s-1", "prefLabel": "Problem solving", "altLabels": ["Analytical thinking"]}, {"code": "s-2", "prefLabel": "Communication", "altLabels": ["Communicating"]}, {"code": "s-3", "prefLabel": "Teamwork", "altLabels": ["Collaboration"]}]}

function normalize(text){ return (''+text).trim().toLowerCase() }

router.post('/map', (req,res)=>{
  const { skills=[] } = req.body
  const mapped = skills.map(s=>{
    const t = normalize(s)
    for (const item of ESCO.skills) { 
      if (normalize(item.prefLabel)===t) return { input:s, code:item.code, label:item.prefLabel }
      if ((item.altLabels||[]).some(a=> normalize(a)===t)) return { input:s, code:item.code, label:item.prefLabel }
    }
    return { input:s, code:null, label:null }
  })
  res.json({ ok:true, mapped })
})
