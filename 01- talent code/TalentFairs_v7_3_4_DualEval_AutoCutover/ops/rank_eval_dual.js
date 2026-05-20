
import { Client } from '@opensearch-project/opensearch'
import fs from 'fs'

const node  = process.env.OPENSEARCH_NODE || 'http://localhost:9200'
const auth  = process.env.OPENSEARCH_AUTH || ''
const ssl   = process.env.OPENSEARCH_SSL === 'true'
const client = new Client({ node, ...(auth ? { auth: { username: auth.split(':')[0], password: auth.split(':')[1] } } : {}), ...(ssl?{ssl:{rejectUnauthorized:false}}:{}) })

const IDX_R = {
  people: process.env.OS_ALIAS_PEOPLE_R || 'tf_people@read',
  jobs:   process.env.OS_ALIAS_JOBS_R   || 'tf_jobs@read',
  posts:  process.env.OS_ALIAS_POSTS_R  || 'tf_posts@read',
  courses:process.env.OS_ALIAS_COURSES_R|| 'tf_courses@read'
}
const METRICS = process.env.OS_METRICS_IDX || 'tf_metrics_ndcg'
const MODEL_ALIAS_INDEX = process.env.OS_MODEL_ALIAS_INDEX || 'tf_meta_model_aliases'

function loadRatings(path, domain){
  const lines = fs.readFileSync(path, 'utf-8').trim().split(/\r?\n/)
  return lines.map(line => {
    const [q, doc, gradeStr] = line.split('\t')
    return { _index: IDX_R[domain], _id: doc, rating: parseInt(gradeStr||'0',10) }
  })
}

async function getModel(alias){
  try {
    const r = await client.get({ index: MODEL_ALIAS_INDEX, id: alias })
    return r.body?._source?.model || null
  } catch(e){ return null }
}

function makeRequestBody(model, k){
  return {
    requests: [{
      id: `eval-${model}`,
      request: {
        query: { match_all: {} },
        rescore: model ? { window_size: 1000, query: { rescore_query: { sltr: { model, params: { keywords: "" } } } } } : undefined
      },
      ratings: []  // filled by outer
    }],
    metric: { ndcg: { k } }
  }
}

async function writeMetric(doc){
  await client.indices.create({ index: METRICS }, { ignore: [400] })
  await client.index({ index: METRICS, refresh: 'false', body: doc })
}

;(async () => {
  const domain = process.argv[2] || 'posts'
  const k = parseInt(process.argv[3] || '10', 10)
  const ratings = loadRatings(`data/ltr/judgments/${domain}.tsv`, domain)

  const prodModel = await getModel(domain + '@prod')
  const shadowModel = await getModel(domain + '@shadow')

  // PROD
  const prodBody = makeRequestBody(prodModel, k)
  prodBody.requests[0].ratings = ratings
  const prodRes = await client.transport.request({ method:'POST', path:`/${IDX_R[domain]}/_rank_eval`, body: prodBody })
  const prodScore = prodRes.body?.metric_score

  // SHADOW
  const shBody = makeRequestBody(shadowModel, k)
  shBody.requests[0].ratings = ratings
  const shRes = await client.transport.request({ method:'POST', path:`/${IDX_R[domain]}/_rank_eval`, body: shBody })
  const shScore = shRes.body?.metric_score

  const now = new Date().toISOString()
  await writeMetric({ '@timestamp': now, domain, model_alias: domain+'@prod',   k, ndcg_at_k: prodScore })
  await writeMetric({ '@timestamp': now, domain, model_alias: domain+'@shadow', k, ndcg_at_k: shScore })

  console.log(JSON.stringify({ ok:true, prod_ndcg: prodScore, shadow_ndcg: shScore }, null, 2))
})().catch(e=>{ console.error(e); process.exit(1) })
