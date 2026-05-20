import { osClient } from './os_client.js'
import { FusionConfig } from './fusion_config.js'
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

export async function searchSLTR({ type, q='', tenantId='public' }){
  const index = IDX[type]
  const featureset = FusionConfig.ltr.featuresets[type]
  const defaultModel = FusionConfig.ltr.models[type]
  // resolve alias: e.g., posts@prod -> tf_ltr_posts_xgb_v3
  const aliasName = `${type}@prod`
  const model = await getAlias(aliasName, defaultModel)

  const body = {
    query: baseline(q, tenantId),
    rescore: {
      window_size: 1000,
      query: {
        rescore_query: {
          sltr: {
            params: { keywords: q },
            model
          }
        }
      }
    },
    size: 100,
    post_filter: { term: { tenantId } },
    ext: { ltr_log: { log_specs: { name: "tf_log", rescore_index: 0 } } }  // لالتقاط الميزات للتدريب
  }
  const r = await osClient.search({ index, body })
  const hits = r.body?.hits?.hits || []
  return hits.map(h => ({
    id: h._id,
    ltrScore: h._score || 0,
    source: h._source || {}
  }))
}
