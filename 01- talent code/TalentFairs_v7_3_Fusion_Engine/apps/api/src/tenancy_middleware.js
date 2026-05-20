export function tenancy(req, _res, next){
  const explicit = (req.headers['x-tenant']||'').toString().trim()
  let tenant = explicit
  if(!tenant){
    const host = (req.headers['host']||'').toString()
    if(host && host.split('.').length>2){
      tenant = host.split('.')[0]
    }
  }
  req.tenantId = tenant || 'public'
  next()
}
