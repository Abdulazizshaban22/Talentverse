
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { Request, Response, NextFunction } from 'express';
import { getEntitlements } from './entitlements';

const jwksUri = process.env.KEYCLOAK_JWKS_URL || '';
const audience = process.env.KEYCLOAK_AUDIENCE || 'api-gateway';
const issuer = process.env.KEYCLOAK_ISSUER || '';
const tokenEndpoint = process.env.KEYCLOAK_TOKEN_URL || '';

const client = jwksClient({ jwksUri });

function getKey(header: any, callback: any){
  client.getSigningKey(header.kid, function(err, key){
    if (err) return callback(err);
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export function requirePermission(resource: string, scope: string){
  return async (req: Request, res: Response, next: NextFunction)=>{
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.substring(7) : null;
    if(!token) return res.status(401).json({error:'missing token'});

    // Verify JWT signature first
    jwt.verify(token, getKey, { audience, issuer, algorithms: ['RS256'] }, async (err, decoded: any)=>{
      if(err) return res.status(401).json({error:'invalid token', detail: err.message});
      // Check UMA entitlements
      const ent = await getEntitlements(token, {
        tokenEndpoint,
        clientId: process.env.KEYCLOAK_CLIENT_ID || 'api-gateway',
        clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || undefined,
        audience
      });
      if((ent as any).error) return res.status(403).json({error:'entitlement failed', detail: (ent as any).error});
      const ok = (ent as any).permissions?.some((p:any)=> p.resource_name===resource && (p.scopes||[]).includes(scope));
      if(!ok) return res.status(403).json({error:'forbidden', need:`${resource}#${scope}`});
      (req as any).user = decoded;
      next();
    });
  }
}
