import './globals.css'
export const metadata = { title: 'Talent Fairs', description: 'Saudi Talentverse' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
