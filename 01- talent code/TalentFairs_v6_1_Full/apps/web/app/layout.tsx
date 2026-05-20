export const metadata = { title: 'TalentFairs', description: 'National Talent Platform' }
export default function RootLayout({children}:{children:React.ReactNode}){
  return <html dir="rtl" lang="ar"><body style={{fontFamily:'system-ui, sans-serif'}}>{children}</body></html>
}
