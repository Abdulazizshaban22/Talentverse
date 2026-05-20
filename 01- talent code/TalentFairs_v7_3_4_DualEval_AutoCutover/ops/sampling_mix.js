
import { Client } from '@opensearch-project/opensearch'
import fs from 'fs'

const node  = process.env.OPENSEARCH_NODE || 'http://localhost:9200'
const auth  = process.env.OPENSEARCH_AUTH || ''
const ssl   = process.env.OPENSEARCH_SSL === 'true'
const client = new Client({ node, ...(auth ? { auth: { username: auth.split(':')[0], password: auth.split(':')[1] } } : {}), ...(ssl?{ssl:{rejectUnauthorized:false}}:{}) })

const LOGS_IDX = process.env.OS_SHADOW_LOGS_IDX || 'tf_shadow_logs'
const IDX_R = {
  people: process.env.OS_ALIAS_PEOPLE_R || 'tf_people@read',
  jobs:   process.env.OS_ALIAS_JOBS_R   || 'tf_jobs@read',
  posts:  process.env.OS_ALIAS_POSTS_R  || 'tf_posts@read',
  courses:process.env.OS_ALIAS_COURSES_R|| 'tf_courses@read'
}

;(async () => {
  const domain = process.argv[2] || 'posts'
  const howMany = parseInt(process.argv[3] || '200', 10)
  const outPath = `data/ltr/judgments/sampled_${domain}.tsv`
  fs.mkdirSync('data/ltr/judgments', { recursive: true })

  // 1) أسئلة من سجلات الشادو
  const q1 = await client.search({
    index: LOGS_IDX, size: 100, body: {
      query: { term: { type: domain } },
      sort: [{ "@timestamp": { order: "desc" } }]
    }
  })
  const queries = new Set((q1.body?.hits?.hits || []).map(h => (h._source?.q || '').toString()).filter(Boolean))

  // 2) عينات عشوائية من الفهرس لإضافة سلبيات متنوعة
  const docs = await client.search({
    index: IDX_R[domain], size: howMany, body: {
      query: { function_score: { query: { match_all: {} }, random_score: {} } },
      _source: false
    }
  })
  const ids = (docs.body?.hits?.hits || []).map(h => h._id)

  // 3) اكتب أحكام افتراضية (0) لتوسيع مجموعة التدريب (سلبيات عشوائية)
  const q = (Array.from(queries)[0] || 'data')
  const lines = ids.map(id => `${q}\t${id}\t0`).join('\n') + '\n'
  fs.writeFileSync(outPath, lines, 'utf-8')
  console.log('Saved', outPath, 'negatives:', ids.length, 'queries_seen:', queries.size)
})().catch(e=>{ console.error(e); process.exit(1) })
