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

const domain = process.argv[2] || 'posts'
const K = parseInt(process.argv[3] || '10', 10)
const judgmentsPath = `data/ltr/judgments/${domain}.tsv`

function loadJudgmentsTSV(path){
  const lines = fs.readFileSync(path, 'utf-8').trim().split(/\r?\n/)
  const ratings = []
  for(const line of lines){
    const [q, doc, gradeStr] = line.split('\t')
    const grade = parseInt(gradeStr,10) || 0
    ratings.push({ _index: IDX_R[domain], _id: doc, rating: grade })
  }
  return ratings
}

;(async () => {
  const ratings = loadJudgmentsTSV(judgmentsPath)
  const body = {
    requests: [{
      id: `${domain} eval`,
      request: { query: { match_all: {} } },   // baseline; LTR rescoring already applied at search time
      ratings
    }],
    metric: { ndcg: { k: K } }
  }
  const r = await client.transport.request({
    method: 'POST',
    path: `/${IDX_R[domain]}/_rank_eval`,
    body
  })
  console.log(JSON.stringify(r.body || {}, null, 2))
})().catch(e=>{ console.error(e); process.exit(1) })
