import { Router } from 'express'
import { FusionConfig } from './fusion_config.js'
import { searchSLTR } from './os_ltr.js'
import { graphScoresFor } from './graph_scores.js'
export const fusion = Router()

function fuse(list, gmap, w_ltr, w_graph){
  return list.map(item => ({
    id: item.id,
    finalScore: (item.ltrScore||0)*w_ltr + ((gmap[item.id]||0)*w_graph),
    ltrScore: item.ltrScore||0,
    graphScore: gmap[item.id]||0,
    source: item.source
  })).sort((a,b)=> b.finalScore - a.finalScore)
}

async function handler(type, req, res){
  const { q='', viewerId=null, top=20 } = req.body||{}
  const tenantId = req.tenantId
  const w = FusionConfig.weights[type]
  const ltr = await searchSLTR({ type, q, tenantId })
  const ids = ltr.map(x=>x.id)
  const gmap = await graphScoresFor(type, ids, tenantId, viewerId)
  const fused = fuse(ltr, gmap, w.ltr, w.graph).slice(0, FusionConfig.cutoffs.top || top)
  res.json({ ok:true, type, items:fused, weights:w })
}

for(const t of ['people','jobs','posts','courses']){
  fusion.post('/'+t, (req,res)=> handler(t, req, res))
}
