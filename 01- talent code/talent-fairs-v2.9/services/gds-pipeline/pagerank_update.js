import neo4j from 'neo4j-driver'

const url = process.env.NEO4J_URL||'neo4j://localhost:7687'
const user = process.env.NEO4J_USERNAME||'neo4j'
const pass = process.env.NEO4J_PASSWORD||'pass'
const db = process.env.NEO4J_DATABASE||'neo4j'
const label = process.env.NEO4J_JOB_LABEL||'Job'
const prop = process.env.NEO4J_PAGERANK_PROP||'pagerank'

const driver = neo4j.driver(url, neo4j.auth.basic(user, pass))
const session = driver.session({ database: db })

async function main(){
  try{
    // Build a simple named graph if not exists
    await session.run(`CALL gds.graph.project('jobsGraph', '${label}', '*')`)
  }catch(e){ /* ignore if exists */ }

  // Compute PR and write back property
  const res = await session.run(`
    CALL gds.pageRank.write('jobsGraph', { maxIterations: 20, dampingFactor: 0.85, writeProperty: $prop })
    YIELD nodePropertiesWritten, ranIterations, didConverge
    RETURN nodePropertiesWritten, ranIterations, didConverge
  `, { prop })
  console.log('PageRank write result:', res.records[0]?.toObject())

  await session.close()
  await driver.close()
}
main().catch(async e=>{ console.error(e); await session.close(); await driver.close(); process.exit(1) })
