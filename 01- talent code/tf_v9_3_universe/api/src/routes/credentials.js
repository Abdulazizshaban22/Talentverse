
import { Router } from 'express'
export const router = Router()
router.post('/openbadges/issue', (req,res)=>res.json({ok:true}))
router.post('/europass/export', (req,res)=>res.json({ok:true}))
