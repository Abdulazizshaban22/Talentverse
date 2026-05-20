
'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
export default function Home(){
  return (
    <main className="grid">
      <motion.div className="card" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:.4}}>
        <h1>TalentFairs v9.4</h1>
        <p className="muted">Go‑Live Mock — ACM + CloudFront + Nafath + HyperPay + nDCG</p>
        <nav>
          <Link href="/feed">المنشورات</Link>
          <Link href="/jobs">الوظائف</Link>
          <Link href="/recruiter">Recruiter Console</Link>
          <Link href="/rankeval">RankEval</Link>
          <Link href="/live">البث الحي</Link>
          <Link href="/skills">ESCO</Link>
        </nav>
      </motion.div>
    </main>
  )
}
