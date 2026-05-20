import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { Request, Response, NextFunction } from 'express';

const jwksUri = process.env.KEYCLOAK_JWKS_URL || '';
const audience = process.env.KEYCLOAK_AUDIENCE || 'api-gateway';
const issuer = process.env.KEYCLOAK_ISSUER || '';

const client = jwksClient({ jwksUri });

function getKey(header: any, callback: any){
  client.getSigningKey(header.kid, function(err, key){
    if (err) return callback(err);
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export function requireScope(scope: string){
  return (req: Request, res: Response, next: NextFunction)=>{
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.substring(7) : null;
    if(!token) return res.status(401).json({error:'missing token'});
    jwt.verify(token, getKey, { audience, issuer, algorithms: ['RS256'] }, (err, decoded: any)=>{
      if(err) return res.status(401).json({error:'invalid token', detail: err.message});
      const permissions = (decoded as any).authorization?.permissions || [];
      const has = permissions.some((p:any)=> (p.scopes||[]).includes(scope));
      if(!has) return res.status(403).json({error:'forbidden', required_scope:scope});
      (req as any).user = decoded;
      next();
    });
  }
}
