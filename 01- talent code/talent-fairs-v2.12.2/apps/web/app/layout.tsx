import Link from 'next/link'
export const metadata = { title: 'Talent Fairs v2.12.2' }
export default function Root({children}:{children:React.ReactNode}){
  return <html lang='ar' dir='rtl'><body>
    <nav style={{padding:12, display:'flex', gap:12, flexWrap:'wrap'}}>
      <Link href="/">الرئيسية</Link>
      <Link href="/admin/rules/packs">Rule Packs</Link>
      <Link href="/admin/ranker/dataset">Dataset (CSV→JSONL + Stats)</Link>
    </nav>
    {children}
  </body></html>
}
