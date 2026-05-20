
import fs from 'fs'
import { Client } from '@opensearch-project/opensearch'
const client = new Client({ node: process.env.OPENSEARCH_NODE || 'http://localhost:9200' })

const defs = [
  ['tf_posts','mappings_posts.json'],
  ['tf_people','mappings_people.json'],
  ['tf_jobs','mappings_jobs.json'],
  ['tf_courses','mappings_courses.json'],
  ['tf_interactions','mappings_interactions.json'],
  ['tf_applicants','mappings_applicants.json'],
  ['tf_classes','mappings_classes.json'],
  ['tf_enrollments','mappings_enrollments.json'],
  ['tf_academicSessions','mappings_academicSessions.json']
]

async function createOrKeep(base, body){
  const idx = base+'-000001'
  const exists = await client.indices.exists({ index: idx })
  if (!exists.body){
    await client.indices.create({ index: idx, body })
    await client.indices.putAlias({ index: idx, name: base+'@prod' })
    await client.indices.putAlias({ index: idx, name: base+'@shadow' })
    console.log('created', base, 'with aliases @prod/@shadow')
  } else {
    console.log('exists', base)
  }
}

async function applyILM(){
  const policy = JSON.parse(fs.readFileSync('search/ilm_tf_default.json','utf8'))
  await client.transport.request({ method:'PUT', path:'/_plugins/_ism/policies/tf_default', body:policy })
  for (const [base] of defs){
    await client.transport.request({ method:'POST', path:`/${base}-000001/_plugins/_ism/add`, body:{policy_id:'tf_default'} })
  }
}

async function main(){
  for (const [base, file] of defs){
    const body = JSON.parse(fs.readFileSync('search/'+file,'utf8'))
    await createOrKeep(base, body)
  }
  await applyILM()
  console.log('bootstrap done.')
}
main().catch(e=>{ console.error(e); process.exit(1) })
