
async function getPosts(){
  const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
  const r = await fetch(base + '/api/feed/home', { cache:'no-store' })
  return r.json()
}
export default async function Feed(){
  const posts = await getPosts()
  return (<main className="grid"><div className="card"><h2>المنشورات</h2><pre>{JSON.stringify(posts,null,2)}</pre></div></main>)
}
