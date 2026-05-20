import { Router } from 'express'
export const scholarshipsRouter = Router()
const SCH=[
  {id:'s1', title:'AI Undergraduate Scholarship', skills:['python','ml','math']},
  {id:'s2', title:'Design Excellence Grant', skills:['design','figma','portfolio']},
  {id:'s3', title:'Robotics Competition Fund', skills:['c++','robotics','control']},
]
function jaccard(a:string[],b:string[]){ const A=new Set(a), B=new Set(b); const inter=[...A].filter(x=>B.has(x)).length; const uni=new Set([...A,...B]).size; return uni===0?0:inter/uni }
scholarshipsRouter.get('/match',(req:any,res:any)=>{
  const profileId=String(req.query.profileId||'demo')
  const skills=(String(req.query.skills||'python,math,git')).split(',').map(s=>s.trim().toLowerCase())
  const matches=SCH.map(s=>({...s,score:jaccard(skills,s.skills)})).sort((a,b)=>b.score-a.score)
  res.json({ok:true,profileId,skills,matches})
})
