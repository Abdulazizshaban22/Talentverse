
'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
export default function Feed(){
  const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
  const [posts,setPosts] = useState([])
  useEffect(()=>{ fetch(API+'/api/feed/home').then(r=>r.json()).then(setPosts) },[])
  return (
    <main className="grid">
      <div className="card"><h2>المنشورات</h2>
        <div className="list">
          {posts.map((p,i)=> (
            <motion.div key={p.id||i} className="item" initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}>
              <div><b>{p.authorId}</b><div className="muted">{new Date(p.ts).toLocaleString()}</div></div>
              <div style={{maxWidth:520}}>{p.text}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  )
}
