import Link from 'next/link'
export const metadata = { title: 'Talent Fairs — Unified v4.0' }
export default function Root({children}:{children:React.ReactNode}){
  return <html lang='ar' dir='rtl'><body>
    <nav style={{padding:12, display:'flex', gap:12, flexWrap:'wrap'}}>
      <Link href="/">الرئيسية</Link>
      <Link href="/admin/oneroster">OneRoster</Link>
      <Link href="/admin/teachers">المعلمون</Link>
      <Link href="/admin/schedule">الجدولة</Link>
      <Link href="/admin/gds">Neo4j GDS</Link>
      <Link href="/guardian">وليّ الأمر</Link>
      <Link href="/admin/explain">Explain‑Why</Link>
      <Link href="/admin/exports">Exports</Link>
      <Link href="/admin/security">SSO / Security</Link>
    </nav>
    {children}
  </body></html>
}
