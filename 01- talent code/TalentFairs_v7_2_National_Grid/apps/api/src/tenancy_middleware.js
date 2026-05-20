export function tenancy(req, _res, next){
  // Priority: x-tenant header → subdomain from Host → 'public'
  const explicit = (req.headers['x-tenant']||'').toString().trim()
  let tenant = explicit
  if(!tenant){
    const host = (req.headers['host']||'').toString()
    // subdomain.tenantfairs.sa => subdomain
    if(host && host.split('.').length>2){
      tenant = host.split('.')[0]
    }
  }
  req.tenantId = tenant || 'public'
  next()
}
