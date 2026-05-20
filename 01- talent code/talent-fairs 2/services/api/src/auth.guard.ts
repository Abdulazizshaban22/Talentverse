import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify } from 'jose'

const jwks = createRemoteJWKSet(new URL(process.env.KEYCLOAK_JWKS_URL || 'http://keycloak:8080/realms/talent/protocol/openid-connect/certs'))
const issuer = process.env.KEYCLOAK_ISSUER || 'http://localhost:8080/realms/talent'

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest()
    const auth = req.headers['authorization'] || ''
    const token = (auth as string).startsWith('Bearer ') ? (auth as string).slice(7) : null
    if (!token) throw new UnauthorizedException('Missing bearer token')
    try {
      const { payload } = await jwtVerify(token, jwks, { issuer })
      // attach user info
      req.user = { sub: payload.sub, email: payload.email, roles: payload.realm_access?.roles || [] }
      return true
    } catch (e) {
      throw new UnauthorizedException('Invalid token')
    }
  }
}
