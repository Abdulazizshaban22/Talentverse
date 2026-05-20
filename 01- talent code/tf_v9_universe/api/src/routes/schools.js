import { Router } from 'express'
export const router=Router();
router.post('/oneroster/upload',(_req,res)=>res.json({ok:true, imported:0}))
