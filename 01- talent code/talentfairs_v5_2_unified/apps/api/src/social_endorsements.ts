import { Router } from 'express'
export const endorseRouter = Router()
type Endorse={id:string,userId:string,skill:string,by:string,weight:number,ts:number}
const DB:Endorse[]=[]
endorseRouter.post('/endorse',(req:any,res:any)=>{
  const userId=String(req.body?.userId||''), skill=String(req.body?.skill||'')
  const by=String(req.body?.by||'anon'), weight=Number(req.body?.weight??1)
  if(!userId||!skill) return res.status(400).json({ok:false,error:'missing_fields'})
  const row:Endorse={id:Math.random().toString(36).slice(2),userId,skill,by,weight,ts:Date.now()}; DB.push(row)
  res.json({ok:true,id:row.id})
})
endorseRouter.get('/endorsements',(req:any,res:any)=>{
  const userId=String(req.query.userId||''); const list=DB.filter(e=>e.userId===userId)
  const totals:Record<string,number>={}; for(const e of list){ totals[e.skill]=(totals[e.skill]||0)+e.weight }
  res.json({ok:true,userId,endorsements:list,totals})
})
