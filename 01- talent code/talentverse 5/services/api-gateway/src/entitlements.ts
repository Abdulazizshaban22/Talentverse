
import axios from 'axios';
import jwt from 'jsonwebtoken';

export interface EntitlementOptions {
  tokenEndpoint: string; // http://keycloak/realms/<realm>/protocol/openid-connect/token
  clientId: string;
  clientSecret?: string;
  audience: string;      // api-gateway
}

export async function getEntitlements(rptOrAccessToken: string, opts: EntitlementOptions){
  // Exchange for RPT using UMA ticket grant (if needed)
  const form = new URLSearchParams();
  form.set('grant_type','urn:ietf:params:oauth:grant-type:uma-ticket');
  form.set('audience', opts.audience);
  form.set('permission', 'institution#read');
  form.set('permission', 'profile#read');
  try{
    const res = await axios.post(opts.tokenEndpoint, form, {
      headers: { 'Content-Type':'application/x-www-form-urlencoded', 'Authorization': `Bearer ${rptOrAccessToken}` },
      auth: opts.clientSecret ? { username: opts.clientId, password: opts.clientSecret } : undefined
    });
    const rpt = res.data['access_token'] || res.data['token'];
    const decoded:any = jwt.decode(rpt) || {};
    const perms = decoded?.authorization?.permissions || [];
    return { rpt, permissions: perms };
  }catch(e:any){
    return { error: e?.response?.data || e?.message };
  }
}
