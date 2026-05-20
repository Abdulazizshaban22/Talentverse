
import { Router } from 'express'
import { Client } from '@opensearch-project/opensearch'
import neo4j from 'neo4j-driver'
import fs from 'fs'

export const router = Router()
const client = new Client({ node: process.env.OPENSEARCH_NODE || 'http://localhost:9200' })
const driver = neo4j.driver('bolt://neo4j:7687', neo4j.auth.basic('neo4j','password'))
const modelPath = '/app/ai/model.json'
const model = fs.existsSync(modelPath) ? JSON.parse(fs.readFileSync(modelPath,'utf8')) : { weights:{ text_bm25:1.0, graph_pr:1.0 } }

function lrScore(hit, pr){
  const bm25 = hit._score || 0
  const w = model.weights || { text_bm25:1.0, graph_pr:1.0 }
  return (w.text_bm25*bm25) + (w.graph_pr*(pr||0))
}

router.get('/fusion', async (req,res)=>{
  const { q='', viewerId='u-1', index='tf_posts@prod', k=20 } = req.query
  const r = await client.search({ index, size: k, query: q?{ multi_match:{query:q,fields:['text^2','authorId']} }:{ match_all:{} } })
  const hits = r.hits.hits

  const session = driver.session()
  const prMap = new Map()
  try {
    const neo = await session.run('MATCH (u:Person {id:$id})-[:FOLLOWS*0..1]->(x) RETURN x.id AS id, 0.1 AS score LIMIT 100', { id: viewerId })
    neo.records.forEach(rec=> prMap.set(rec.get('id'), rec.get('score')))
  } catch(_) {}
  await session.close()

  const fused = hits.map(h=>({ id: h._source.id, _source:h._source, score: lrScore(h, prMap.get(h._source.authorId)||0) }))
                   .sort((a,b)=>b.score-a.score)

  res.json({ ok:true, total:hits.length, results:fused })
})
