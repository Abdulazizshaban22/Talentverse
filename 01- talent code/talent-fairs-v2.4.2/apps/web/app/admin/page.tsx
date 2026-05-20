'use client'
import Link from 'next/link'
export default function Admin(){
  return <main style={{padding:24}}>
    <h2>لوحة الإدارة</h2>
    <ul>
      <li><Link href="/admin/jobs">الوظائف</Link></li>
      <li><Link href="/admin/challenges">التحديات</Link></li>
    </ul>
  </main>
}
