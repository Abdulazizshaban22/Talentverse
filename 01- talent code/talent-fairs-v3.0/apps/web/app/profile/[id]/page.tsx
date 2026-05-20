import { notFound } from 'next/navigation'
export default async function Profile({params}:{params:{id:string}}){
  const id = params.id
  // هذه صفحة عرض؛ البيانات تُجلب من API في الإنتاج
  return <main style={{padding:24}}>
    <h2>ملف الحياة — {id}</h2>
    <p>المنحنى النمائي والأنشطة ستظهر هنا (عرض فقط).</p>
  </main>
}
