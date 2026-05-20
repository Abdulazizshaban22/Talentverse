
import { Router } from 'express'
export const router = Router()
const ledger = new Map()
router.post('/earn', (req,res)=>{ const { userId, points=0, reason } = req.body; ledger.set(userId, (ledger.get(userId)||0)+points); res.json({ ok:true, balance: ledger.get(userId), reason }) })
router.post('/redeem', (req,res)=>{ const { userId, cost=0, itemId } = req.body; const cur = ledger.get(userId)||0; if (cur<cost) return res.status(400).json({ ok:false, error:'INSUFFICIENT_POINTS' }); ledger.set(userId, cur-cost); res.json({ ok:true, balance: ledger.get(userId), itemId }) })
router.get('/balance/:userId', (req,res)=> res.json({ ok:true, userId:req.params.userId, balance: ledger.get(req.params.userId)||0 }))
