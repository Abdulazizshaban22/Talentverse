
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body style={{fontFamily:'system-ui', background:'#f7f7f9'}}>{children}</body>
    </html>
  );
}
