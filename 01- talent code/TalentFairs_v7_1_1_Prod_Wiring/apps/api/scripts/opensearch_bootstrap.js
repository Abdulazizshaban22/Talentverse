// Usage:
//   OPENSEARCH_NODE=https://... OPENSEARCH_AUTH=user:pass node scripts/opensearch_bootstrap.js
import { Client } from '@opensearch-project/opensearch'

const node  = process.env.OPENSEARCH_NODE || 'http://localhost:9200'
const auth  = process.env.OPENSEARCH_AUTH || '' // 'user:pass'
const ssl   = process.env.OPENSEARCH_SSL === 'true'

const client = new Client({
  node,
  ...(auth ? { auth: { username: auth.split(':')[0], password: auth.split(':')[1] } } : {}),
  ...(ssl  ? { ssl: { rejectUnauthorized: false } } : {})
})

const IDX = [
  { key:'posts',  pattern:'tf_posts-*',  alias_r:'tf_posts@read',  alias_w:'tf_posts@write'  },
  { key:'people', pattern:'tf_people-*', alias_r:'tf_people@read', alias_w:'tf_people@write' },
  { key:'jobs',   pattern:'tf_jobs-*',   alias_r:'tf_jobs@read',   alias_w:'tf_jobs@write'   },
  { key:'course', pattern:'tf_courses-*',alias_r:'tf_courses@read',alias_w:'tf_courses@write'}
]

const mappingsByKey = {
  posts: {
    dynamic: 'strict',
    properties: {
      tenantId: { type:'keyword' },
      type:     { type:'keyword' },
      authorId: { type:'keyword' },
      text:     { type:'text', analyzer:'standard' },
      tags:     { type:'keyword' },
      ts:       { type:'date' },
      likes:    { type:'integer' },
      comments: { type:'integer' },
      media:    { type:'boolean' }
    }
  },
  people: {
    dynamic:'true',
    properties: {
      tenantId:{ type:'keyword' },
      id:{ type:'keyword' },
      name:{ type:'text', analyzer:'standard' },
      headline:{ type:'text', analyzer:'standard' },
      skills:{ type:'keyword' },
      location:{ type:'keyword' },
      updated_at:{ type:'date' }
    }
  },
  jobs: {
    dynamic:'true',
    properties: {
      tenantId:{ type:'keyword' },
      id:{ type:'keyword' },
      title:{ type:'text', analyzer:'standard' },
      company:{ type:'keyword' },
      city:{ type:'keyword' },
      skills:{ type:'keyword' },
      posted_at:{ type:'date' }
    }
  },
  course: {
    dynamic:'true',
    properties: {
      tenantId:{ type:'keyword' },
      id:{ type:'keyword' },
      title:{ type:'text', analyzer:'standard' },
      about:{ type:'text', analyzer:'standard' },
      provider:{ type:'keyword' },
      price:{ type:'float' },
      updated_at:{ type:'date' }
    }
  }
}

async function ensureTemplate(pattern, key){
  const name = `tf_template_${key}`
  const exists = await client.indices.existsIndexTemplate({ name })
  if(!exists.body){
    await client.indices.putIndexTemplate({
      name,
      body: {
        index_patterns: [pattern],
        template: {
          settings: { number_of_shards: 1, number_of_replicas: 1 },
          mappings: mappingsByKey[key]
        }
      }
    })
    console.log('Created template', name)
  } else {
    console.log('Template exists', name)
  }
}

async function ensureFirstIndex(pattern, aliasRead, aliasWrite){
  // Determine base e.g. tf_posts-000001
  const base = pattern.replace('*','000001')
  const exists = await client.indices.exists({ index: base })
  if(!exists.body){
    await client.indices.create({
      index: base,
      body: {
        aliases: {
          [aliasRead]: {},
          [aliasWrite]: { is_write_index: true }
        }
      }
    })
    console.log('Created index', base, 'with aliases', aliasRead, aliasWrite)
  } else {
    // Ensure aliases exist
    await client.indices.updateAliases({
      body: { actions: [
        { add: { index: base, alias: aliasRead } },
        { add: { index: base, alias: aliasWrite, is_write_index:true } }
      ]}
    }).catch(()=>{})
    console.log('Ensured aliases on', base)
  }
}

async function main(){
  for(const {key, pattern, alias_r, alias_w} of IDX){
    await ensureTemplate(pattern, key)
    await ensureFirstIndex(pattern, alias_r, alias_w)
  }
  console.log('Done.')
}

main().catch(e=>{ console.error(e); process.exit(1) })
