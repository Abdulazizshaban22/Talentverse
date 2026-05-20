import Link from 'next/link'
export const metadata = { title: 'Talent Fairs v2.10' }
export default function Root({children}:{children:React.ReactNode}){
  return <html lang='ar' dir='rtl'><body>
    <nav style={{padding:12, display:'flex', gap:12, flexWrap:'wrap'}}>
      <Link href="/">الرئيسية</Link>
      <Link href="/admin/jobs">وظائف</Link>
      <Link href="/admin/challenges">التحديات</Link>
      <Link href="/admin/acl">ACL</Link>
      <Link href="/admin/audit">التدقيق</Link>
      <Link href="/observability">المراقبة</Link>
      <Link href="/notifications/test">اختبار التنبيهات</Link>
    </nav>
    {children}
  </body></html>
}
