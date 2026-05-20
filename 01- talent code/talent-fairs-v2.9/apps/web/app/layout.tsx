import Link from 'next/link'
export const metadata = { title: 'Talent Fairs v2.9' }
export default function Root({children}:{children:React.ReactNode}){
  return <html lang='ar' dir='rtl'><body>
    <nav style={{padding:12, display:'flex', gap:12, flexWrap:'wrap'}}>
      <Link href="/">الرئيسية</Link>
      <Link href="/realtime/pro">البث المتقدم</Link>
      <Link href="/admin/acl">قوائم التحكم</Link>
      <Link href="/admin/audit">التدقيق</Link>
      <Link href="/observability">المراقبة والتنبيهات</Link>
    </nav>
    {children}
  </body></html>
}
