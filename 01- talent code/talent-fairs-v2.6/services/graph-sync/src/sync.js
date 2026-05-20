import neo4j from 'neo4j-driver'
import pg from 'pg'
const { Client } = pg

const NEO4J_URL = process.env.NEO4J_URL||''
const NEO4J_USERNAME = process.env.NEO4J_USERNAME||''
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD||''
const DB = process.env.DATABASE_URL

async function run(){
  if(!NEO4J_URL){ console.log('NEO4J_URL not set; skipping'); return }
  const driver = neo4j.driver(NEO4J_URL, neo4j.auth.basic(NEO4J_USERNAME, NEO4J_PASSWORD))
  const session = driver.session()
  const db = new Client({ connectionString: DB })
  await db.connect()

  const users = (await db.query('select id from "User" limit 500')).rows
  const skills = (await db.query('select id,name from "Skill" limit 2000')).rows
  const jobs = (await db.query('select id,title from "Job" limit 1000')).rows
  const profSkills = (await db.query('select "profileId","skillId" from "ProfileSkill"')).rows
  const jobSkills = (await db.query('select "jobId","skillId" from "JobSkill"')).rows

  await session.run('CREATE CONSTRAINT IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE')
  await session.run('CREATE CONSTRAINT IF NOT EXISTS FOR (s:Skill) REQUIRE s.id IS UNIQUE')
  await session.run('CREATE CONSTRAINT IF NOT EXISTS FOR (j:Job) REQUIRE j.id IS UNIQUE')

  for(const u of users){ await session.run('MERGE (:User {id:$id})', { id: u.id }) }
  for(const s of skills){ await session.run('MERGE (:Skill {id:$id, name:$name})', { id: s.id, name: s.name }) }
  for(const j of jobs){ await session.run('MERGE (:Job {id:$id, title:$title})', { id: j.id, title: j.title }) }
  for(const ps of profSkills){ await session.run('MATCH (u:User{id:$uid}),(s:Skill{id:$sid}) MERGE (u)-[:HAS_SKILL]->(s)', { uid: ps.profileId, sid: ps.skillId }) }
  for(const js of jobSkills){ await session.run('MATCH (j:Job{id:$jid}),(s:Skill{id:$sid}) MERGE (j)-[:REQUIRES]->(s)', { jid: js.jobId, sid: js.skillId }) }

  await db.end(); await session.close(); await driver.close()
  console.log('Graph sync complete')
}

run().catch(e=>{ console.error(e); process.exit(1) })
