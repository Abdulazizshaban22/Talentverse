
import { Router } from 'express'
import fs from 'fs'
import { Client } from '@opensearch-project/opensearch'
export const router = Router()
const client = new Client({ node: process.env.OPENSEARCH_NODE || 'http://localhost:9200' })
const store = '/tmp/rankeval_judgments.json'
const metricsFile = '/app/metrics/ndcg.json'
function readStore(){ if (!fs.existsSync(store)) return []; try{ return JSON.parse(fs.readFileSync(store,'utf8')) } catch{ return [] } }
function writeStore(arr){ fs.writeFileSync(store, JSON.stringify(arr, null, 2)) }
function ndcgAtK(rels, k=10){ const dcg = (a)=> a.slice(0,k).reduce((acc,r,i)=> acc + ((2**r - 1)/Math.log2(i+2)), 0); const ideal = [...rels.slice(0,k)].sort((a,b)=>b-a); const d = dcg(rels); const id = dcg(ideal); return id>0 ? d/id : 0 }
router.post('/collect', (req,res)=>{ const arr = readStore(); arr.push({ ts: Date.now(), ...req.body }); writeStore(arr); res.json({ ok:true, count: arr.length }) })
router.post('/ndcg', (req,res)=>{ const { relevances=[], k=10 } = req.body; const v = ndcgAtK(relevances, k); try{ const old = fs.existsSync(metricsFile) ? JSON.parse(fs.readFileSync(metricsFile,'utf8')) : []; old.push({ ts: Date.now(), ndcg: v, variant: 'prod' }); fs.writeFileSync(metricsFile, JSON.stringify(old, null, 2)) }catch{}; res.json({ ok:true, ndcg: v }) })
router.get('/metrics', (_req,res)=>{ const data = (fs.existsSync(metricsFile) ? JSON.parse(fs.readFileSync(metricsFile,'utf8')) : []); res.json({ ok:true, data }) })
router.post('/opensearch', async (req,res)=>{ const { index='tf_posts@shadow', body={} } = req.body; try{ const r = await client.transport.request({ method:'POST', path:`/${encodeURIComponent(index)}/_rank_eval`, body }); res.json({ ok:true, result: r.body || r }) }catch(e){ res.status(400).json({ ok:false, error: e.message }) } })
