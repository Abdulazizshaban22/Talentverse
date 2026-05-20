export default function Profile({params}:{params:{id:string}}){
  return <main style={{padding:24}}>
    <h1>الملف — {params.id}</h1>
    <p>سيتم هنا عرض Talent Passport AR + Badges + ESCO skills + التاريخ المهني.</p>
  </main>
}
