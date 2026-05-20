import { Router } from 'express'
export const govRouter = Router()
govRouter.get('/moe/student/:civilId', (req:any,res:any)=>{
  res.json({ ok:true, source:'MoE', civilId:req.params.civilId, stages:['Primary','Intermediate','Secondary'] })
})
govRouter.get('/gosi/summary/:civilId', (req:any,res:any)=>{
  res.json({ ok:true, source:'GOSI', civilId:req.params.civilId, months: 128, employers: 3 })
})
