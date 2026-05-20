
import Link from 'next/link'
export default function Home(){
  return (
    <main className="grid">
      <div className="card">
        <h1>TalentFairs v9.2</h1>
        <p className="muted">لوحة التوظيف • تقييم الذكاء • بث حي • تصميم عربي RTL</p>
        <nav>
          <Link href="/feed">المنشورات</Link>
          <Link href="/jobs">الوظائف</Link>
          <Link href="/recruiter">Recruiter Console</Link>
          <Link href="/rankeval">RankEval</Link>
          <Link href="/live">البث الحي</Link>
        </nav>
      </div>
    </main>
  )
}
