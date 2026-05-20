import './globals.css'
import AuthButtons from '../components/AuthButtons'
import { NextAuthProvider } from './providers'

export const metadata = { title: 'Talent Fairs', description: 'Saudi Talentverse' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <NextAuthProvider>
          <div className="p-4"><AuthButtons/></div>
          {children}
        </NextAuthProvider>
      </body>
    </html>
  );
}
