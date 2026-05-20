import { Client } from '@opensearch-project/opensearch'
const host = process.env.OPENSEARCH_URL || 'http://localhost:9200'
export const osClient = new Client({ node: host })
