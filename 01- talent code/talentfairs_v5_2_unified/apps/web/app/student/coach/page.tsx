'use client'
import { useEffect, useState } from 'react'
export default function GrowthCoach(){
  const [today, setToday] = useState<any>(null)
  const [tips, setTips] = useState<string[]>([])
  useEffect(()=>{ (async()=>{
    try{
      const r = await fetch('http://localhost:4000/k12/coach/today'); setToday(await r.json())
      const t = await fetch('http://localhost:4000/k12/coach/guardian-tips'); setTips((await t.json()).tips||[])
    }catch{ setToday({ok:true,date:new Date().toISOString().slice(0,10),tasks:[{id:'t1',title:'قراءة 10 دقائق',points:5}]}); setTips(['تابع ابنك أثناء القراءة','شجّعه بالمكافأة']) }
  })() },[])
  return <main style={{padding:24}}>
    <h1>Growth Coach (K‑12)</h1>
    {today?.tasks?.map((t:any)=>(
      <div key={t.id} style={{display:'flex', gap:12, alignItems:'center', padding:8, border:'1px solid #eee', borderRadius:8, margin:'8px 0'}}>
        <div style={{flex:1}}><div style={{fontWeight:600}}>{t.title}</div><div style={{opacity:0.7}}>+{t.points} نقاط</div></div>
        <button>إنهاء</button>
      </div>
    ))}
    <h3 style={{marginTop:24}}>نصائح لوليّ الأمر</h3>
    <ul>{tips.map((x,i)=><li key={i}>{x}</li>)}</ul>
  </main>
}
