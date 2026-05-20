import NextAuth from "next-auth"
import Keycloak from "next-auth/providers/keycloak"
const handler = NextAuth({
  providers:[ Keycloak({ clientId: process.env.KEYCLOAK_CLIENT_ID!, clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!, issuer: process.env.KEYCLOAK_ISSUER }) ],
  session:{ strategy:'jwt' }
})
export { handler as GET, handler as POST }
