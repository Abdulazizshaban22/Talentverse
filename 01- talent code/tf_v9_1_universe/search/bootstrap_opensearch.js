
import fs from 'fs'
import { Client } from '@opensearch-project/opensearch'
const client = new Client({ node: process.env.OPENSEARCH_NODE || 'http://localhost:9200' })

const defs = [
  ['tf_posts','mappings_posts.json'],
  ['tf_people','mappings_people.json'],
  ['tf_jobs','mappings_jobs.json'],
  ['tf_courses','mappings_courses.json'],
  ['tf_interactions','mappings_interactions.json']
]

async function createOrKeep(name, body){
  const r = await client.indices.exists({ index: name })
  if (!r.body){
    await client.indices.create({ index: name+'-000001', body })
    await client.indices.putAlias({ index: name+'-000001', name: name+'@prod' })
    await client.indices.putAlias({ index: name+'-000001', name: name+'@shadow' })
    console.log('created', name, 'with prod/shadow aliases')
  } else {
    console.log('exists', name)
  }
}

async function applyILM(){
  const policy = JSON.parse(fs.readFileSync('search/ilm_tf_default.json','utf8'))
  await client.transport.request({ method:'PUT', path:'/_plugins/_ism/policies/tf_default', body:policy })
  for (const [name] of defs){
    await client.transport.request({ method:'POST', path:`/${name}-000001/_plugins/_ism/add`, body:{policy_id:'tf_default'} })
  }
}

async function main(){
  for (const [name, file] of defs){
    const body = JSON.parse(fs.readFileSync('search/'+file,'utf8'))
    await createOrKeep(name, body)
  }
  await applyILM()
  console.log('bootstrap done.')
}
main().catch(e=>{ console.error(e); process.exit(1) })
