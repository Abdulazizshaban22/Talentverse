
import { osClient } from './os_client.js'
import { getAlias } from './model_alias.js'

const IDX = {
  people: process.env.OS_ALIAS_PEOPLE_R || 'tf_people@read',
  jobs:   process.env.OS_ALIAS_JOBS_R   || 'tf_jobs@read',
  posts:  process.env.OS_ALIAS_POSTS_R  || 'tf_posts@read',
  courses:process.env.OS_ALIAS_COURSES_R|| 'tf_courses@read'
}

function baseline(q, tenantId){
  return {
    bool: {
      must: [{ multi_match: { query: q, fields: ['text^3','title^2','skills^2','name^2','about','tags'] }}],
      filter: [{ term: { tenantId } }]
    }
  }
}

// run search with a resolved LTR model (aliasName -> actual model)
export async function searchWithAlias({ type, q='', tenantId='public', aliasName='posts@prod' }){
  const index = IDX[type]
  const model = await getAlias(aliasName, null)
  const body = model ? {
    query: baseline(q, tenantId),
    rescore: {
      window_size: 1000,
      query: { rescore_query: { sltr: { model, params: { keywords: q } } } }
    },
    size: 100,
    post_filter: { term: { tenantId } },
    ext: { ltr_log: { log_specs: { name: "tf_log", rescore_index: 0 } } }
  } : {
    query: baseline(q, tenantId),
    size: 100
  }
  const r = await osClient.search({ index, body })
  const hits = r.body?.hits?.hits || []
  return hits.map(h => ({ id: h._id, score: h._score || 0, _source: h._source || {} }))
}
