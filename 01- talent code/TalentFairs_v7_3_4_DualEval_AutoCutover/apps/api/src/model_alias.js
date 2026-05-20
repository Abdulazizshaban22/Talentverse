
import { osClient } from './os_client.js'
const INDEX = process.env.OS_MODEL_ALIAS_INDEX || 'tf_meta_model_aliases'
const CACHE_TTL_MS = 30000
const cache = new Map()

export async function setAlias(alias, model){
  await osClient.indices.create({ index: INDEX }, { ignore: [400] })
  await osClient.index({ index: INDEX, id: alias, refresh:'true', body: { alias, model, ts: Date.now() } })
  cache.set(alias, { model, ts: Date.now() })
  return { ok:true }
}

export async function getAlias(alias, fallback=null){
  const now = Date.now()
  const c = cache.get(alias)
  if (c && (now - c.ts) < CACHE_TTL_MS) return c.model
  try {
    const r = await osClient.get({ index: INDEX, id: alias })
    const m = r.body?._source?.model || fallback
    cache.set(alias, { model:m, ts: now }); return m
  } catch(e){
    return fallback
  }
}
