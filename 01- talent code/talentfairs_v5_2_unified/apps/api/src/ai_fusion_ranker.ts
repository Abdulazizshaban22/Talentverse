import { Router } from 'express'
export const fusionRouter = Router()
function zminmax(a:number[]){ if(a.length===0) return []; const mn=Math.min(...a), mx=Math.max(...a); return mx===mn? a.map(_=>0.5): a.map(v=>(v-mn)/(mx-mn)) }
fusionRouter.post('/fusion-rank',(req:any,res:any)=>{
  const items = (req.body?.items||[]) as {id:string,ltr:number,graph:number}[]
  const wl = Number(req.body?.ltr_weight ?? 0.6), wg = Number(req.body?.graph_weight ?? 0.4)
  const L=zminmax(items.map(i=>i.ltr)), G=zminmax(items.map(i=>i.graph))
  const fused=items.map((i,k)=>({id:i.id, score: wl*L[k] + wg*G[k]})).sort((a,b)=>b.score-a.score)
  res.json({ok:true,fused})
})
