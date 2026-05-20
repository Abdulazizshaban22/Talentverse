import Link from 'next/link'
export const metadata = { title: 'Talent Fairs v3.1' }
export default function Root({children}:{children:React.ReactNode}){
  return <html lang='ar' dir='rtl'><body>
    <nav style={{padding:12, display:'flex', gap:12, flexWrap:'wrap'}}>
      <Link href="/">الرئيسية</Link>
      <Link href="/school">لوحة المدارس</Link>
      <Link href="/admin/sis">مُدخل SIS (OneRoster)</Link>
      <Link href="/admin/gds">Neo4j GDS</Link>
      <Link href="/guardian">لوحة وليّ الأمر</Link>
    </nav>
    {children}
  </body></html>
}
