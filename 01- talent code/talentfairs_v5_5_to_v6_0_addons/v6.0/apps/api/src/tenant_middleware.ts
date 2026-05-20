import type { Request, Response, NextFunction } from 'express'

export function tenantFromHost(req:Request, _res:Response, next:NextFunction){
  // Derive tenant from subdomain: <tenant>.talentfairs.sa
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '')
  const parts = host.split('.')
  const tenant = (parts.length > 2) ? parts[0] : (req.header('x-tenant-id') || 'public')
  ;(req as any).tenantId = String(tenant).toLowerCase()
  next()
}
