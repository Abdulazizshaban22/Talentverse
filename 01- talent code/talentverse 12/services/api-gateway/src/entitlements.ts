
import axios from 'axios';
import jwt from 'jsonwebtoken';

type Mode = 'UMA'|'ENTITLEMENT';
const MODE:Mode = (process.env.AUTHZ_MODE as Mode) || 'UMA';

export interface EntitlementOptions {
  tokenEndpoint: string; // http://keycloak/realms/<realm>/protocol/openid-connect/token
  audience: string;      // api-gateway (resource server clientId)
  clientId?: string;
  clientSecret?: string;
  resource?: string;
  scope?: string;
}

export async function fetchAuthorization(accessToken: string, opts: EntitlementOptions){
  if (MODE === 'ENTITLEMENT'){
    // Non-UMA entitlement (Keycloak Entitlement API)
    const form = new URLSearchParams();
    form.set('grant_type','urn:ietf:params:oauth:grant-type:uma-ticket');
    form.set('audience', opts.audience);
    if (opts.resource && opts.scope){
      form.append('permission', `${opts.resource}#${opts.scope}`);
    }
    const res = await axios.post(opts.tokenEndpoint, form, {
      headers: { 'Content-Type':'application/x-www-form-urlencoded', 'Authorization': `Bearer ${accessToken}` },
      auth: opts.clientSecret ? { username: opts.clientId || '', password: opts.clientSecret } : undefined
    });
    const rpt = res.data['access_token'] || res.data['token'];
    const decoded:any = jwt.decode(rpt) || {};
    const perms = decoded?.authorization?.permissions || [];
    const exp = (decoded?.exp ? Number(decoded.exp) : Math.floor(Date.now()/1000)+60);
    return { rpt, permissions: perms, exp };
  }else{
    // UMA ticket (1.0) flow compacted via token endpoint (Keycloak supports issuing RPT here)
    const form = new URLSearchParams();
    form.set('grant_type','urn:ietf:params:oauth:grant-type:uma-ticket');
    form.set('audience', opts.audience);
    if (opts.resource && opts.scope){
      form.append('permission', `${opts.resource}#${opts.scope}`);
    }
    const res = await axios.post(opts.tokenEndpoint, form, {
      headers: { 'Content-Type':'application/x-www-form-urlencoded', 'Authorization': `Bearer ${accessToken}` },
      auth: opts.clientSecret ? { username: opts.clientId || '', password: opts.clientSecret } : undefined
    });
    const rpt = res.data['access_token'] || res.data['token'];
    const decoded:any = jwt.decode(rpt) || {};
    const perms = decoded?.authorization?.permissions || [];
    const exp = (decoded?.exp ? Number(decoded.exp) : Math.floor(Date.now()/1000)+60);
    return { rpt, permissions: perms, exp };
  }
}
