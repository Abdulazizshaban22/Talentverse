import { Client } from '@opensearch-project/opensearch'

const node  = process.env.OPENSEARCH_NODE || 'http://localhost:9200'
const auth  = process.env.OPENSEARCH_AUTH || '' // 'user:pass' if needed
const ssl   = process.env.OPENSEARCH_SSL === 'true'

export const osClient = new Client({
  node,
  ...(auth ? { auth: { username: auth.split(':')[0], password: auth.split(':')[1] } } : {}),
  ...(ssl  ? { ssl: { rejectUnauthorized: false } } : {})
})

export async function ensureIndex(name){
  const exists = await osClient.indices.exists({ index: name })
  if(!exists.body){
    await osClient.indices.create({
      index: name,
      body: {
        settings: { number_of_shards: 1 },
        mappings: {
          properties: {
            tenantId: { type: 'keyword' },
            type:     { type: 'keyword' },
            authorId: { type: 'keyword' },
            text:     { type: 'text' },
            tags:     { type: 'keyword' },
            ts:       { type: 'date' },
            likes:    { type: 'integer' },
            comments: { type: 'integer' }
          }
        }
      }
    })
  }
}
