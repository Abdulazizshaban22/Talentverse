
'use client'
import { useEffect, useState } from 'react'
async function get(path:string){ const r = await fetch('/api/proxy/'+path); return r.json() }
export default function Home(){
  const [edu,setEdu]=useState<any[]>([]); const [sp,setSp]=useState<any[]>([]); const [hr,setHr]=useState<any[]>([])
  useEffect(()=>{ (async()=>{
    setEdu((await get('v1/gov/stats/edu')).rows||[])
    setSp((await get('v1/gov/stats/sports')).rows||[])
    setHr((await get('v1/gov/stats/hr')).rows||[])
  })() },[])
  return (<main style={{padding:24}}>
    <h1>اللوحة الوطنية — GovDash</h1>
    <section><h3>التعليم</h3><table><thead><tr><th>المنطقة</th><th>عدد الطلبة</th><th>GPA متوسط</th></tr></thead>
    <tbody>{edu.map((r:any,i:number)=>(<tr key={i}><td>{r.region}</td><td>{r.students}</td><td>{r.avg_gpa}</td></tr>))}</tbody></table></section>
    <section><h3>الرياضة</h3><table><thead><tr><th>المنطقة</th><th>عدد الرياضيين</th></tr></thead>
    <tbody>{sp.map((r:any,i:number)=>(<tr key={i}><td>{r.region}</td><td>{r.athletes}</td></tr>))}</tbody></table></section>
    <section><h3>الموظفون</h3><table><thead><tr><th>المنطقة</th><th>عدد الموظفين</th><th>متوسط الأداء</th></tr></thead>
    <tbody>{hr.map((r:any,i:number)=>(<tr key={i}><td>{r.region}</td><td>{r.employees}</td><td>{r.avg_perf}</td></tr>))}</tbody></table></section>
  </main>)
}
