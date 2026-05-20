import Link from 'next/link'
export default function Home() {
  return (
    <main className="min-h-screen grid place-items-center p-8">
      <div className="max-w-xl text-center space-y-4">
        <h1 className="text-3xl font-bold">تالنت فيرس — Talent Fairs</h1>
        <p>انطلق لاكتشاف المواهب، التحديات، والجوائز.</p>
        <div className="flex gap-3 justify-center">
          <Link className="underline" href="/talent">لوحة الموهبة</Link>
          <a className="underline" href="http://localhost:3010">لوحة الجهات (Admin)</a>
          <Link className="underline" href="/rewards">المتجر</Link>
        </div>
      </div>
    </main>
  )
}
