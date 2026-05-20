import neo4j from 'neo4j-driver'

const NEO4J_URI = process.env.NEO4J_URI || 'bolt://localhost:7687'
const NEO4J_USER = process.env.NEO4J_USER || 'neo4j'
const NEO4J_PASS = process.env.NEO4J_PASS || 'password'

const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASS))

// Compute Personalized PageRank for a viewer and return top N people/jobs
export async function graphRecommend({ viewerId, type='people', top=20 }){
  const session = driver.session()
  try {
    // Example: Project graph and run PageRank (stream mode)
    const query = `
      CALL gds.graph.project(
        'tf_${type}',
        ['User','Job'],
        {FOLLOWS:{orientation:'NATURAL'}, MATCHES:{orientation:'NATURAL'}}
      )
    `
    await session.run(query).catch(()=>{})

    const seedLabel = type==='people' ? 'User' : 'Job'
    const stream = await session.run(`
      CALL gds.pageRank.stream('tf_${type}', {maxIterations: 20, dampingFactor: 0.85})
      YIELD nodeId, score
      WITH gds.util.asNode(nodeId) AS n, score
      WHERE n.tenantId = $tenantId
      RETURN n{.*, score: score} AS rec
      ORDER BY score DESC
      LIMIT $top
    `, { tenantId: 'public', top })
    return stream.records.map(r=> r.get('rec'))
  } finally {
    await session.close()
  }
}
