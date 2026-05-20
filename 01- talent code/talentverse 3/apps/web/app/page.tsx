
'use client';
import { Button } from '@talentverse/ui';

export default function Home() {
  return (
    <main style={{maxWidth: 960, margin: '64px auto', padding: 24}}>
      <h1>موهبة+ — بوابة المواهب الوطنية</h1>
      <p>سجّل ملفك المواهبي، خذ تقييمًا قصيرًا، وشاهد الترشيحات الذكية للمسابقات والمنح.</p>
      <div style={{display:'flex', gap: 12}}>
        <Button onClick={()=>location.href='/signin'}>تسجيل الدخول</Button>
        <Button onClick={()=>location.href='/profile'}>ملفي</Button>
      </div>
    </main>
  );
}
