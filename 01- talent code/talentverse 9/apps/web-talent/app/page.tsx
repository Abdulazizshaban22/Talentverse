
import Link from 'next/link'
export default function Home(){return (<main style={padding:24}>
  <h1>TalentVerse — web-talent</h1>
  <p>بوابة المواهب.</p>
  <nav>
    <Link href="/auth">تسجيل الدخول</Link> | <Link href="/dashboard">لوحة التحكم</Link>
  </nav>
</main>)}
