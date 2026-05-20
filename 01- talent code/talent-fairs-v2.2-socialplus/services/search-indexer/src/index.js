import { osClient } from './client.js'
import { fetch } from 'undici'
const index = process.env.OS_POSTS_INDEX || 'posts-ar'
const API = process.env.API_BASE || 'http://api:4000'
const TOKEN = process.env.API_TOKEN || ''
async function fetchPosts(){
  const r = await fetch(`${API}/posts`, { headers: TOKEN? { Authorization: `Bearer ${TOKEN}` } : {} })
  return await r.json()
}
async function indexPosts(posts){
  const ops = []
  for(const p of posts){
    ops.push({ index: { _index: index, _id: p.id } })
    ops.push({ id:p.id, authorId:p.authorId, text:p.text||'', tags:p.tags||[], createdAt:p.createdAt })
  }
  if(ops.length){
    await osClient.bulk({ refresh: true, body: ops })
    console.log('Indexed', posts.length, 'posts')
  } else {
    console.log('No posts to index')
  }
}
async function run(){
  const posts = await fetchPosts()
  await indexPosts(posts)
}
run().catch(e=>{ console.error(e); process.exit(1) })
