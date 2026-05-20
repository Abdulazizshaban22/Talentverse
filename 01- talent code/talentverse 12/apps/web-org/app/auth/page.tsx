
'use client'
import { signIn, signOut, useSession } from "next-auth/react"
export default function AuthPage(){
  const { data: session } = useSession()
  if (session) return (<main style={{padding:24}}>
    <p>مرحبًا {session.user?.name}</p>
    <button onClick={()=>signOut()}>تسجيل الخروج</button>
  </main>)
  return (<main style={{padding:24}}>
    <button onClick={()=>signIn('keycloak')}>دخول عبر Keycloak</button>
  </main>)
}
