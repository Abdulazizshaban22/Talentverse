export const metadata = { title: 'Talent Fairs' }
export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang="ar" dir="rtl">
      <body style={{fontFamily:'system-ui, -apple-system, Segoe UI, Roboto, sans-serif'}}>{children}</body>
    </html>
  )
}
