
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

function loadRatings(path, domain){
  const lines = fs.readFileSync(path, 'utf-8').trim().split(/\r?\n/)
  return lines.map(line => {
    const [q, doc, gradeStr] = line.split('\t')
    return { _index: IDX_R[domain], _id: doc, rating: parseInt(gradeStr||'0',10) }
  })
}

async function rankEval(index, ratings){
  const body = { requests:[{ id:'eval', request:{ query:{ match_all:{} } }, ratings }], metric:{ ndcg:{ k: parseInt(process.argv[3]||'10',10) } } }
  const r = await client.transport.request({ method:'POST', path:`/${index}/_rank_eval`, body })
  return r.body || {}
}

async function writeMetric(doc){
  await client.indices.create({ index: METRICS }, { ignore:[400] })
  await client.index({ index: METRICS, refresh:'false', body: doc })
}

;(async () => {
  const domain = process.argv[2] || 'posts'
  const k = parseInt(process.argv[3]||'10',10)
  const ratings = loadRatings(`data/ltr/judgments/${domain}.tsv`, domain)

  // prod
  const prodRes = await rankEval(IDX_R[domain], ratings)
  const prodScore = prodRes?.metric_score

  // shadow: we emulate by switching alias to shadow model during eval via stored field
  // Simplification: write both scores as separate docs, consumer compares trends over time.
  const now = new Date().toISOString()
  await writeMetric({ '@timestamp': now, domain, model_alias: domain+'@prod',  k, ndcg_at_k: prodScore })

  // NOTE: For shadow eval, run the same evaluation after temporarily flipping model alias to shadow externally, or compute via a separate index.
  // Here we just store prod; your CI should write shadow too after a second pass.
  console.log(JSON.stringify({ ok:true, prod_ndcg: prodScore, note: 'Write shadow score similarly by running eval against shadow model.' }, null, 2))
})().catch(e=>{ console.error(e); process.exit(1) })
