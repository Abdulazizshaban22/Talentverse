import Link from 'next/link'
export const metadata = { title: 'Talent Fairs v2.4.2' }
export default function Root({children}:{children:React.ReactNode}){
  return <html lang='ar' dir='rtl'><body>
    <nav style={{padding:12, display:'flex', gap:12, flexWrap:'wrap'}}>
      <Link href="/">الرئيسية</Link>
      <Link href="/admin">لوحة التحكم</Link>
      <Link href="/messages">الرسائل</Link>
      <Link href="/rewards">المكافآت</Link>
    </nav>
    {children}
  </body></html>
}
