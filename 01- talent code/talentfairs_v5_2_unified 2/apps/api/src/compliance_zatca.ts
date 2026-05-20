import { Router } from 'express'
export const zatcaRouter = Router()
zatcaRouter.post('/sign', async (req:any,res:any)=>{
  const invoice = req.body?.invoice || {}
  res.json({ ok:true, signed:true, invoiceId: invoice.id||'demo' })
})
