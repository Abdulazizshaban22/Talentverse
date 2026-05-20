import { Client } from '@opensearch-project/opensearch'
const node  = process.env.OPENSEARCH_NODE || 'http://localhost:9200'
const auth  = process.env.OPENSEARCH_AUTH || ''
const ssl   = process.env.OPENSEARCH_SSL === 'true'
const client = new Client({ node, ...(auth ? { auth: { username: auth.split(':')[0], password: auth.split(':')[1] } } : {}), ...(ssl?{ssl:{rejectUnauthorized:false}}:{}) })
const INDEX = process.env.OS_MODEL_ALIAS_INDEX || 'tf_meta_model_aliases'
const alias = process.argv[2]
if(!alias){ console.error('Usage: node ops/model_alias_get.js <alias>'); process.exit(1) }
;(async () => {
  try {
    const r = await client.get({ index: INDEX, id: alias })
    console.log(r.body?._source?.model || '')
  } catch(e){ console.error(e); process.exit(2) }
})()
