
export default function SignIn() {
  return (
    <main style={{maxWidth: 640, margin: '64px auto', padding: 24}}>
      <h2>تسجيل الدخول عبر Keycloak</h2>
      <a href={process.env.NEXT_PUBLIC_KEYCLOAK_LOGIN_URL || '#'}>تسجيل الدخول</a>
    </main>
  );
}
