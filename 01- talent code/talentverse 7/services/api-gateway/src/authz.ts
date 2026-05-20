
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { Request, Response, NextFunction } from 'express';
import { fetchAuthorization } from './entitlements';
import { decisionCache, key } from './decision-cache';

const jwksUri = process.env.KEYCLOAK_JWKS_URL || '';
const audience = process.env.KEYCLOAK_AUDIENCE || 'api-gateway';
const issuer = process.env.KEYCLOAK_ISSUER || '';
const tokenEndpoint = process.env.KEYCLOAK_TOKEN_URL || '';

const client = jwksClient({ jwksUri });

function getKey(header: any, callback: any){
  client.getSigningKey(header.kid, function(err, ky){
    if (err) return callback(err);
    const signingKey = (ky as any)?.getPublicKey();
    callback(null, signingKey);
  });
}

export function requirePermission(resource: string, scope: string){
  return async (req: Request, res: Response, next: NextFunction)=>{
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.substring(7) : null;
    if(!token) return res.status(401).json({error:'missing token'});

    jwt.verify(token, getKey, { audience, issuer, algorithms: ['RS256'] }, async (err, decoded: any)=>{
      if(err) return res.status(401).json({error:'invalid token', detail: err.message});
      const sub = (decoded && (decoded.sub||decoded.preferred_username)) || 'anon';
      // Decision cache lookup
      const k = key({ sub, resource, scope });
      const hit = decisionCache.get(k);
      if (hit && hit.allow && hit.exp*1000 > Date.now()){
        (req as any).user = decoded;
        return next();
      }
      // Ask Keycloak for authorization data (RPT)
      try{
        const ent = await fetchAuthorization(token, {
          tokenEndpoint,
          audience: audience,
          clientId: process.env.KEYCLOAK_CLIENT_ID,
          clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
          resource, scope
        });
        const allowed = (ent as any).permissions?.some((p:any)=> p.resource_name===resource && (p.scopes||[]).includes(scope));
        decisionCache.set(k, { allow: !!allowed, exp: (ent as any).exp || Math.floor(Date.now()/1000)+60 });
        if (!allowed) return res.status(403).json({error:'forbidden', need:`${resource}#${scope}`});
        (req as any).user = decoded;
        return next();
      }catch(e:any){
        return res.status(403).json({error:'entitlement failed', detail: e?.message || 'unknown'});
      }
    });
  }
}
