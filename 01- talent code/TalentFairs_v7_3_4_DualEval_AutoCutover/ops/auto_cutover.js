
import { Client } from '@opensearch-project/opensearch'

const node  = process.env.OPENSEARCH_NODE || 'http://localhost:9200'
const auth  = process.env.OPENSEARCH_AUTH || ''
const ssl   = process.env.OPENSEARCH_SSL === 'true'
const client = new Client({ node, ...(auth ? { auth: { username: auth.split(':')[0], password: auth.split(':')[1] } } : {}), ...(ssl?{ssl:{rejectUnauthorized:false}}:{}) })

const METRICS = process.env.OS_METRICS_IDX || 'tf_metrics_ndcg'
const ALIAS_IDX = process.env.OS_MODEL_ALIAS_INDEX || 'tf_meta_model_aliases'

async function getModel(alias){
  try {
    const r = await client.get({ index: ALIAS_IDX, id: alias })
    return r.body?._source?.model || null
  } catch(e){ return null }
}

;(async () => {
  const domain = process.argv[2] || 'posts'
  const days = parseInt(process.argv[3] || '7', 10)
  const minGain = parseFloat(process.argv[4] || '0.03')  // +3%

  // Aggregate last N days
  const body = {
    size: 0,
    query: {
      bool: {
        must: [
          { term: { domain } },
          { range: { "@timestamp": { gte: `now-${days}d/d`, lte: "now" } } }
        ]
      }
    },
    aggs: {
      prod: { filter: { term: { model_alias: domain + "@prod" } }, aggs: { avg_ndcg: { avg: { field: "ndcg_at_k" } } } },
      shadow: { filter: { term: { model_alias: domain + "@shadow" } }, aggs: { avg_ndcg: { avg: { field: "ndcg_at_k" } } } }
    }
  }
  const r = await client.search({ index: METRICS, body })
  const prodAvg = r.body?.aggregations?.prod?.avg_ndcg?.value || 0
  const shAvg = r.body?.aggregations?.shadow?.avg_ndcg?.value || 0
  const gain = (prodAvg===0) ? (shAvg>0 ? 1 : 0) : ((shAvg - prodAvg) / prodAvg)

  const decision = (gain >= minGain)
  const prodModel = await getModel(domain + '@prod')
  const shadowModel = await getModel(domain + '@shadow')

  console.log(JSON.stringify({
    ok:true, domain, days, minGain, prodAvg, shAvg, gain, decision,
    prodModel, shadowModel
  }, null, 2))

  if(decision && shadowModel){
    // Flip prod alias to shadow model (zero-downtime)
    const res = await client.index({
      index: ALIAS_IDX, id: domain+'@prod', refresh:'true',
      body: { alias: domain+'@prod', model: shadowModel, ts: Date.now() }
    })
    console.log(JSON.stringify({ cutover:true, result: res.body?.result || 'updated' }))
  }
})().catch(e=>{ console.error(e); process.exit(1) })
