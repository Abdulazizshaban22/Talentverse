import { Router } from 'express'
export const whatifRouter = Router()
whatifRouter.post('/whatif',(req,res)=>{
  const lw=Number(req.body?.ltr_weight??0.6), gw=Number(req.body?.graph_weight??0.4)
  const sample=(req.body?.sample||[]) as {id:string,ltr:number,graph:number}[]
  const out=sample.map(s=>({id:s.id, final: lw*s.ltr + gw*s.graph})).sort((a,b)=>b.final-a.final)
  res.json({ok:true,weights:{ltr:lw,graph:gw},results:out})
})
