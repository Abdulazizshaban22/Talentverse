'use client'
import { signIn, signOut } from "next-auth/react"

export default function AuthButtons(){
  return <div className="flex gap-3 justify-center">
    <button className="underline" onClick={()=>signIn('keycloak')}>تسجيل الدخول</button>
    <button className="underline" onClick={()=>signOut()}>تسجيل الخروج</button>
  </div>
}
