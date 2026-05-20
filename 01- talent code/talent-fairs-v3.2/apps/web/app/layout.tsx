import Link from 'next/link'
export const metadata = { title: 'Talent Fairs v3.2' }
export default function Root({children}:{children:React.ReactNode}){
  return <html lang='ar' dir='rtl'><body>
    <nav style={{padding:12, display:'flex', gap:12, flexWrap:'wrap'}}>
      <Link href="/">الرئيسية</Link>
      <Link href="/admin/oneroster">OneRoster</Link>
      <Link href="/admin/teachers">المعلّمون</Link>
      <Link href="/admin/schedule">جدولة التقييمات</Link>
    </nav>{children}
  </body></html>
}
