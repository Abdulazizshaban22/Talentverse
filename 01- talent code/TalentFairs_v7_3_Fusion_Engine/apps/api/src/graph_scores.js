import neo4j from 'neo4j-driver'

const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687'
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j'
const NEO4J_PASS = process.env.NEO4J_PASS || 'password'

const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASS))

export async function graphScoresFor(type, ids, tenantId='public', viewerId=null){
  if(!ids?.length) return {}
  const session = driver.session()
  const label = type==='people' ? 'User' : (type==='jobs' ? 'Job' : 'Post')
  try {
    // Example: assume projected graph exists as gds graph; use their base nodes
    // Here we simulate retrieval by simple MATCH with stored score field (or compute PageRank on demand)
    const res = await session.run(`
      UNWIND $ids AS nid
      MATCH (n:${label} {id:nid, tenantId:$tenant})
      RETURN n.id AS id, coalesce(n.graphScore, 0.0) AS score
    `, { ids, tenant: tenantId })
    const map = {}
    for(const r of res.records){
      map[r.get('id')] = r.get('score')
    }
    return map
  } finally {
    await session.close()
  }
}
