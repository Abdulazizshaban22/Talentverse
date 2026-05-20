
import './globals.css'
export const metadata = { title: 'TalentFairs v9.2', description:'Recruiter + RankEval + Realtime + RTL' }
export default function RootLayout({ children }){
  return (<html lang="ar" dir="rtl"><body style={{margin:24}}>{children}</body></html>)
}
