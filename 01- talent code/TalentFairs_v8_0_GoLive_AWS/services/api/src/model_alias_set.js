
import { Client } from '@opensearch-project/opensearch'
const node  = process.env.OPENSEARCH_NODE || 'http://localhost:9200'
const auth  = process.env.OPENSEARCH_AUTH || ''
const ssl   = process.env.OPENSEARCH_SSL === 'true'
const client = new Client({ node, ...(auth?{auth:{username:auth.split(':')[0],password:auth.split(':')[1]}}:{}), ...(ssl?{ssl:{rejectUnauthorized:false}}:{}) })

const INDEX = process.env.OS_MODEL_ALIAS_INDEX || 'tf_meta_model_aliases'
const alias = process.argv[2], model = process.argv[3]

if(!alias || !model){
  console.error('Usage: node src/model_alias_set.js <alias> <model>'); process.exit(1)
}

;(async () => {
  await client.indices.create({ index: INDEX }, { ignore: [400] })
  const res = await client.index({ index: INDEX, id: alias, refresh: 'true', body: { alias, model, ts: Date.now() } })
  console.log(res.body)
})().catch(e=>{ console.error(e); process.exit(2) })
