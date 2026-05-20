import { Client } from '@opensearch-project/opensearch'

const node  = process.env.OPENSEARCH_NODE || 'http://localhost:9200'
const auth  = process.env.OPENSEARCH_AUTH || ''
const ssl   = process.env.OPENSEARCH_SSL === 'true'

export const osClient = new Client({
  node,
  ...(auth ? { auth: { username: auth.split(':')[0], password: auth.split(':')[1] } } : {}),
  ...(ssl  ? { ssl: { rejectUnauthorized: false } } : {})
})

const IDX = {
  people: process.env.OS_ALIAS_PEOPLE_R || 'tf_people@read',
  jobs:   process.env.OS_ALIAS_JOBS_R   || 'tf_jobs@read',
  posts:  process.env.OS_ALIAS_POSTS_R  || 'tf_posts@read'
}

export async function searchSLTR({ type, q, tenantId, featureset }){
  const index = IDX[type]
  if(!index) throw new Error('Unknown type '+type)

  // Prefer SLTR; fall back to BM25 if plugin missing
  const bodySLTR = {
    query: {
      sltr: {
        _name: "rank_ltr",
        featureset: featureset || `tf_features_${type}`,
        params: { keywords: q || '' }
      }
    },
    size: 100,
    post_filter: { term: { tenantId } }
  }

  try {
    const r = await osClient.search({ index, body: bodySLTR })
    const hits = r.body?.hits?.hits || []
    return hits.map(h => ({
      id: h._id,
      ltrScore: h._score || 0,
      source: h._source || {}
    }))
  } catch(e){
    // Fallback BM25 multi_match
    const r = await osClient.search({
      index,
      body: {
        query: { bool: {
          must:[{ multi_match:{ query:q, fields:['text^3','title^2','skills^2','name^2','about','tags'] }}],
          filter:[{ term:{ tenantId } }]
        } },
        size: 100
      }
    })
    const hits = r.body?.hits?.hits || []
    return hits.map(h => ({
      id: h._id,
      ltrScore: h._score || 0,
      source: h._source || {}
    }))
  }
}
