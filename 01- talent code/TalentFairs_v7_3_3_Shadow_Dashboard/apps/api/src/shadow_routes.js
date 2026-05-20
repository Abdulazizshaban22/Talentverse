
import { Router } from 'express'
import { searchWithAlias } from './os_ltr.js'
import { writeShadowLog } from './shadow_writer.js'

export const shadow = Router()

async function handle(type, req, res){
  const { q='', viewerId=null, top=20 } = req.body||{}
  const tenantId = req.tenantId

  // primary (prod) — returned to user
  const prodAlias = `${type}@prod`
  const prod = await searchWithAlias({ type, q, tenantId, aliasName: prodAlias })

  // shadow — not returned to user, only logged
  const shadowAlias = `${type}@shadow`
  const shad = await searchWithAlias({ type, q, tenantId, aliasName: shadowAlias })

  // log pair for offline eval
  await writeShadowLog({
    type, tenantId, viewerId, q,
    prodAlias, shadowAlias,
    prodTop: prod.slice(0, top).map(x=>x.id),
    shadowTop: shad.slice(0, top).map(x=>x.id),
    ts: Date.now()
  })

  res.json({ ok:true, type, items: prod.slice(0, top), meta:{ prodAlias, shadowAlias, logged:true } })
}

for(const t of ['people','jobs','posts','courses']){
  shadow.post('/'+t, (req,res)=> handle(t, req, res))
}
