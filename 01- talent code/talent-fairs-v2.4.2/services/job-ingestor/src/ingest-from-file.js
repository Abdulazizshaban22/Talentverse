import fs from 'fs'
import pg from 'pg'
const { Client } = pg

const DB = process.env.DATABASE_URL
const FILE = process.env.JOBS_FILE || 'samples/jobs.json'

async function run(){
  const jobs = JSON.parse(fs.readFileSync(FILE,'utf-8'))
  const db = new Client({ connectionString: DB })
  await db.connect()
  for(const j of jobs){
    const r = await db.query(
      'insert into "Job"(id,title,company,description,"employmentType","location","applyUrl","createdAt") values (gen_random_uuid(),$1,$2,$3,$4,$5,$6,now()) returning id',
      [j.title, j.company, j.description||'', j.employmentType||null, j.location||null, j.applyUrl||null]
    )
    const jobId = r.rows[0].id
    for(const s of (j.skills||[])){
      const sk = await db.query('insert into "Skill"(id,name) values (gen_random_uuid(),$1) on conflict(name) do update set name=excluded.name returning id',[s])
      const skillId = sk.rows[0].id
      await db.query('insert into "JobSkill"(id,"jobId","skillId",weight) values (gen_random_uuid(),$1,$2,1) on conflict("jobId","skillId") do nothing',[jobId, skillId])
    }
  }
  await db.end()
  console.log('Jobs ingested from', FILE, 'count=', jobs.length)
}
run().catch(e=>{ console.error(e); process.exit(1) })
