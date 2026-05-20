import Link from 'next/link'
export const metadata = { title: 'Talent Fairs v2.12.1' }
export default function Root({children}:{children:React.ReactNode}){
  return <html lang='ar' dir='rtl'><body>
    <nav style={{padding:12, display:'flex', gap:12, flexWrap:'wrap'}}>
      <Link href="/">الرئيسية</Link>
      <Link href="/admin/rules/templates">قوالب القواعد</Link>
      <Link href="/admin/ranker/dataset">Dataset (CSV→JSONL)</Link>
    </nav>
    {children}
  </body></html>
}
