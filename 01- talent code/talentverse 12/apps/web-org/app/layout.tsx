
import './globals.css';
export const metadata = { title: 'TalentVerse — web-org', description: 'National talent platform' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
