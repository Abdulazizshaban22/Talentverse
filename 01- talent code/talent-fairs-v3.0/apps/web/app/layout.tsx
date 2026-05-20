import Link from 'next/link'
export const metadata = { title: 'Talent Fairs v3.0 — Talent Genome' }
export default function Root({children}:{children:React.ReactNode}){
  return <html lang='ar' dir='rtl'><body>
    <nav style={{padding:12, display:'flex', gap:12, flexWrap:'wrap'}}>
      <Link href="/">الرئيسية</Link>
      <Link href="/school">لوحة المدارس</Link>
      <Link href="/guardian">لوحة أولياء الأمور</Link>
      <Link href="/profile/demo">ملف حياة — مثال</Link>
      <Link href="/admin/compliance/consents">الامتثال والموافقات</Link>
    </nav>
    {children}
  </body></html>
}
