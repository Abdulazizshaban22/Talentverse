import { Client } from '@opensearch-project/opensearch'

const node  = process.env.OPENSEARCH_NODE || 'http://localhost:9200'
const auth  = process.env.OPENSEARCH_AUTH || ''
const ssl   = process.env.OPENSEARCH_SSL === 'true'

export const osClient = new Client({
  node,
  ...(auth ? { auth: { username: auth.split(':')[0], password: auth.split(':')[1] } } : {}),
  ...(ssl  ? { ssl: { rejectUnauthorized: false } } : {})
})

export const OS = {
  POSTS_W : process.env.OS_INDEX_POSTS   || 'tf_posts@write',
  POSTS_R : process.env.OS_ALIAS_POSTS_R || 'tf_posts@read',
  PEOPLE_W: process.env.OS_INDEX_PEOPLE  || 'tf_people@write',
  PEOPLE_R: process.env.OS_ALIAS_PEOPLE_R|| 'tf_people@read',
  JOBS_W  : process.env.OS_INDEX_JOBS    || 'tf_jobs@write',
  JOBS_R  : process.env.OS_ALIAS_JOBS_R  || 'tf_jobs@read',
  COUR_W  : process.env.OS_INDEX_COURSE  || 'tf_courses@write',
  COUR_R  : process.env.OS_ALIAS_COUR_R  || 'tf_courses@read',
}
