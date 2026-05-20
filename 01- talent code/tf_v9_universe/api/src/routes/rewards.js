
import { Router } from 'express'
export const router=Router()
const ledger=new Map()
router.post('/earn',(req,res)=>{const {userId,points=0}=req.body; ledger.set(userId,(ledger.get(userId)||0)+points); res.json({ok:true,balance:ledger.get(userId)})})
router.post('/redeem',(req,res)=>{const {userId,cost=0}=req.body; const cur=ledger.get(userId)||0; if(cur<cost)return res.status(400).json({ok:false}); ledger.set(userId,cur-cost); res.json({ok:true,balance:ledger.get(userId)})})
router.get('/balance/:id',(req,res)=>res.json({ok:true,balance:ledger.get(req.params.id)||0}))
