import fs from 'fs'
import pg from 'pg'
const { Client } = pg

const DB = process.env.DATABASE_URL
const FILE = process.env.ESCO_FILE || 'samples/esco_sample.json'

async function run(){
  const items = JSON.parse(fs.readFileSync(FILE,'utf-8'))
  const db = new Client({ connectionString: DB })
  await db.connect()
  for(const it of items){
    await db.query(
      `insert into "Skill"(id,name,"escoId",kind) values (gen_random_uuid(),$1,$2,$3)
       on conflict("escoId") do update set name=excluded.name, kind=excluded.kind`,
       [it.name, it.escoId, it.kind||null]
    )
  }
  await db.end()
  console.log('ESCO seeded from', FILE, 'count=', items.length)
}
run().catch(e=>{ console.error(e); process.exit(1) })
