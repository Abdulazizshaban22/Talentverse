import { NextAuthProvider } from './providers'
import Link from 'next/link'
export const metadata = { title: 'Talent Fairs', description: 'Saudi Talentverse' }
export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang='ar' dir='rtl'><body>
    <NextAuthProvider/>
    <nav style={{padding:12, display:'flex', gap:12}}>
      <Link href="/">الرئيسية</Link>
      <Link href="/social">الصفحة الاجتماعية</Link>
      <Link href="/rewards">المتجر</Link>
      <Link href="/search">بحث</Link>
    </nav>
    {children}
  </body></html>
}
