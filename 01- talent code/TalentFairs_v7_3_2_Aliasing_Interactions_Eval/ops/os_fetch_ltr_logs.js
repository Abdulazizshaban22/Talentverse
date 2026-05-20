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

const dom = process.argv[2] || 'posts'
const index = IDX_R[dom]
const body = {
  query: { sltr: { _name:"logged_features", featureset: `tf_features_${dom}`, params:{ keywords:"data" } } },
  ext: { ltr_log: { log_specs: { name:"tf_log", named_query:"logged_features" } } },
  size: 200
}
const out = `out/logs_${dom}.json`
;(async () => {
  const r = await client.search({ index, body })
  fs.mkdirSync('out', { recursive: true })
  fs.writeFileSync(out, JSON.stringify(r.body?.hits?.hits || [], null, 2))
  console.log('Saved', out)
})().catch(e=>{ console.error(e); process.exit(1) })
