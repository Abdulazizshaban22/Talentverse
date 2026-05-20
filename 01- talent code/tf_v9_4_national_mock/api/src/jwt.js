
import { jwtVerify, createRemoteJWKSet } from 'jose'
const jwksUri = process.env.KEYCLOAK_JWKS_URL
let JWKS = null
if (jwksUri) {
  try { JWKS = createRemoteJWKSet(new URL(jwksUri)) } catch { JWKS = null }
}
export async function verifyToken(token){
  if (!token) throw new Error('NO_TOKEN')
  if (!JWKS) throw new Error('NO_JWKS')
  const { payload } = await jwtVerify(token, JWKS, {
    audience: process.env.JWT_EXPECTED_AUD,
    issuer: process.env.JWT_EXPECTED_ISS,
  })
  return payload
}
