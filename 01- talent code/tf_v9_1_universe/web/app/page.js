
import Link from 'next/link'
export default function Home(){
  return (
    <main>
      <h1>TalentFairs v9.1</h1>
      <ul>
        <li><Link href="/feed">Feed</Link></li>
        <li><Link href="/jobs">Jobs</Link></li>
        <li><Link href="/courses">Courses</Link></li>
        <li><Link href="/rewards">Rewards</Link></li>
        <li><Link href="/recruiter">Recruiter Console</Link></li>
      </ul>
    </main>
  )
}
