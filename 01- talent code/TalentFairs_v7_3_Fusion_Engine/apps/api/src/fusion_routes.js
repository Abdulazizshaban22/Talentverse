import { Router } from 'express'
import { FusionConfig } from './fusion_config.js'
import { searchSLTR } from './os_ltr.js'
import { graphScoresFor } from './graph_scores.js'

export const fusion = Router()

function fuse(list, gmap, w_ltr, w_graph){
  return list.map(item => ({
    id: item.id,
    finalScore: (item.ltrScore||0)*w_ltr + ( (gmap[item.id]||0) * w_graph ),
    ltrScore: item.ltrScore||0,
    graphScore: gmap[item.id]||0,
    source: item.source
  })).sort((a,b)=> b.finalScore - a.finalScore)
}

fusion.post('/people', async (req,res)=>{
  const { q='', viewerId=null, top=20 } = req.body||{}
  const tenantId = req.tenantId
  const w = FusionConfig.weights.people
  const ltr = await searchSLTR({ type:'people', q, tenantId, featureset:'tf_features_people' })
  const ids = ltr.map(x=>x.id)
  const gmap = await graphScoresFor('people', ids, tenantId, viewerId)
  const fused = fuse(ltr, gmap, w.ltr, w.graph).slice(0, FusionConfig.cutoffs.top || top)
  res.json({ ok:true, items:fused, weights:w })
})

fusion.post('/jobs', async (req,res)=>{
  const { q='', viewerId=null, top=20 } = req.body||{}
  const tenantId = req.tenantId
  const w = FusionConfig.weights.jobs
  const ltr = await searchSLTR({ type:'jobs', q, tenantId, featureset:'tf_features_jobs' })
  const ids = ltr.map(x=>x.id)
  const gmap = await graphScoresFor('jobs', ids, tenantId, viewerId)
  const fused = fuse(ltr, gmap, w.ltr, w.graph).slice(0, FusionConfig.cutoffs.top || top)
  res.json({ ok:true, items:fused, weights:w })
})

fusion.post('/posts', async (req,res)=>{
  const { q='', viewerId=null, top=20 } = req.body||{}
  const tenantId = req.tenantId
  const w = FusionConfig.weights.posts
  const ltr = await searchSLTR({ type:'posts', q, tenantId, featureset:'tf_features_posts' })
  const ids = ltr.map(x=>x.id)
  const gmap = await graphScoresFor('posts', ids, tenantId, viewerId)
  const fused = fuse(ltr, gmap, w.ltr, w.graph).slice(0, FusionConfig.cutoffs.top || top)
  res.json({ ok:true, items:fused, weights:w })
})
