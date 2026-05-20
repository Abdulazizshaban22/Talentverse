
import { Client } from '@opensearch-project/opensearch'
const node  = process.env.OPENSEARCH_NODE || 'http://localhost:9200'
const auth  = process.env.OPENSEARCH_AUTH || ''
const ssl   = process.env.OPENSEARCH_SSL === 'true'
const client = new Client({ node, ...(auth?{auth:{username:auth.split(':')[0],password:auth.split(':')[1]}}:{}), ...(ssl?{ssl:{rejectUnauthorized:false}}:{}) })

const indices = ['tf_people','tf_jobs','tf_posts','tf_courses']
const ilm = {
  policy: {
    phases: {
      hot:   { actions: { rollover: { max_age: '7d', max_primary_shard_size: '30gb' } } },
      warm:  { actions: { } },
      delete:{ min_age: '90d', actions: { delete: {} } }
    }
  }
}

async function run(){
  try{
    await client.ilm.putLifecycle({ policy: 'tf_default', body: ilm })
  }catch(_){}
  for(const idx of indices){
    const base = idx + '-000001'
    try{
      await client.indices.create({
        index: base,
        body: {
          settings: { 'index.lifecycle.name': 'tf_default', 'index.lifecycle.rollover_alias': idx },
          aliases:  { [idx]: { is_write_index: true } }
        }
      }, { ignore: [400] })
    }catch(e){ console.error(e.meta?.body || e) }
  }
  console.log('Bootstrap done.')
}
run().catch(e=>{ console.error(e); process.exit(1) })
