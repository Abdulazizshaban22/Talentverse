import { osClient } from './client.js'
const index = process.env.OS_POSTS_INDEX || 'posts-ar'
const mapping = {
  settings: {
    analysis: { analyzer: { arabic: { type: 'arabic' } } }
  },
  mappings: {
    properties: {
      id: { type: 'keyword' },
      authorId: { type: 'keyword' },
      text: { type: 'text', analyzer: 'arabic' },
      tags: { type: 'keyword' },
      createdAt: { type: 'date' }
    }
  }
}
async function run(){
  const exists = await osClient.indices.exists({ index }) }
  if(!exists.body){
    await osClient.indices.create({ index, body: mapping }) }
    console.log('Created index', index)
  } else {
    console.log('Index exists', index)
}
run().catch(e=>{ console.error(e); process.exit(1) }) }
