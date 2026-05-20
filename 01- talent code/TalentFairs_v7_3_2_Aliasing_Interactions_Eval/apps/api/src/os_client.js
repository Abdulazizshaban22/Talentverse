import { Client } from '@opensearch-project/opensearch'
export const osClient = new Client({
  node: process.env.OPENSEARCH_NODE || 'http://localhost:9200',
  ...(process.env.OPENSEARCH_AUTH ? { auth: {
    username: process.env.OPENSEARCH_AUTH.split(':')[0],
    password: process.env.OPENSEARCH_AUTH.split(':')[1]
  }} : {}),
  ...(process.env.OPENSEARCH_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {})
})
