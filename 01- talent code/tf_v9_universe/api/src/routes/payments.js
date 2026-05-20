import { Router } from 'express'
export const router=Router();
router.post('/tap/webhook',(req,res)=>res.json({ok:true}));
router.post('/hyperpay/webhook',(req,res)=>res.json({ok:true}));
