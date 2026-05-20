import neo4j from 'neo4j-driver'

const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687'
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j'
const NEO4J_PASS = process.env.NEO4J_PASS || 'password'
const GRAPH_NAME = process.env.NEO4J_GDS_GRAPH || 'talent_graph'

const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASS))

export async function graphScoresFor(type, ids, tenantId='public', viewerId=null){
  if(!ids?.length) return {}
  const session = driver.session()
  const label = type==='people' ? 'User' : (type==='jobs' ? 'Job' : (type==='courses' ? 'Course' : 'Post'))
  try {
    if(viewerId){
      try {
        const res = await session.run(`
          CALL gds.pageRank.stream($graph, {maxIterations:20, dampingFactor:0.85})
          YIELD nodeId, score
          WITH gds.util.asNode(nodeId) AS n, score
          WHERE (n:User OR n:Job OR n:Course OR n:Post) AND n.tenantId=$tenant
          WITH n.id AS id, score
          WHERE id IN $ids
          RETURN id, score
        `, { graph: GRAPH_NAME, ids, tenant: tenantId })
        const map = {}; for(const r of res.records){ map[r.get('id')] = r.get('score') }
        if(Object.keys(map).length) return map
      } catch(e){}
    }
    const res = await session.run(`
      UNWIND $ids AS nid
      MATCH (n:${label} {id:nid, tenantId:$tenant})
      RETURN n.id AS id, coalesce(n.graphScore, 0.0) AS score
    `, { ids, tenant: tenantId })
    const map = {}; for(const r of res.records){ map[r.get('id')] = r.get('score') }
    return map
  } finally { await session.close() }
}
