import pg from 'pg'
const {Client}=pg
const DB=process.env.DATABASE_URL
async function run(){const db=new Client({connectionString:DB});await db.connect();const seed=[{escoId:'skill/123',name:'JavaScript',kind:'skill'},{escoId:'skill/456',name:'Project management',kind:'transversal'}];for(const it of seed){await db.query("insert into \"Skill\"(id,name,\"escoId\",kind) values (gen_random_uuid(),$1,$2,$3) on conflict(\"escoId\") do update set name=excluded.name, kind=excluded.kind",[it.name,it.escoId,it.kind])}await db.end();console.log('ESCO seed complete:',seed.length)}
run().catch(e=>{console.error(e);process.exit(1)})
