import express from 'express'
import http from 'http'
import { createRemoteJWKSet, jwtVerify } from 'jose'

const app = express()
const server = http.createServer(app)
app.use(express.json())

const JWKS_URL = process.env.OIDC_JWKS||''
const ISSUER = process.env.OIDC_ISSUER||''
const CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID||''
const rolesPath = 'realm_access.roles' // realm roles

async function auth(req:any,res:any,next:any){
  try{
    const hdr = String(req.headers.authorization||'')
    if(!hdr.startsWith('Bearer ')) return res.status(401).json({ok:false,error:'no_token'})
    const token = hdr.slice(7)
    const JWKS = createRemoteJWKSet(new URL(JWKS_URL))
    const { payload } = await jwtVerify(token, JWKS, { issuer: ISSUER, audience: CLIENT_ID })
    req.user = payload; next()
  }catch(e:any){ res.status(401).json({ ok:false, error:'invalid_token', detail:String(e) }) }
}
function hasRole(role:string){
  return (req:any,res:any,next:any)=>{
    const roles = (((req.user||{})['realm_access']||{})['roles']||[]) as string[]
    if(roles.includes(role)) return next()
    return res.status(403).json({ ok:false, error:'forbidden', need: role })
  }
}

app.get('/public', (_req,res)=> res.json({ ok:true }))
app.get('/teacher/area', auth, hasRole('Teacher'), (_req,res)=> res.json({ ok:true, area:'teacher' }))
app.get('/guardian/area', auth, hasRole('Guardian'), (_req,res)=> res.json({ ok:true, area:'guardian' }))
app.get('/admin/area', auth, hasRole('Admin'), (_req,res)=> res.json({ ok:true, area:'admin' }))

server.listen(4000, ()=> console.log('API v3.3 listening on 4000'))
