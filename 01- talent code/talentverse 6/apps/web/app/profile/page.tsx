
'use client';

export default function Profile() {
  return (
    <main style={{maxWidth: 720, margin: '64px auto', padding: 24}}>
      <h2>ملفي المواهبي</h2>
      <form>
        <label>الاسم</label><input placeholder="الاسم الكامل" /><br/>
        <label>الهوايات</label><input placeholder="كرة قدم، رسم، برمجة" /><br/>
        <button type="submit">حفظ</button>
      </form>
    </main>
  );
}
