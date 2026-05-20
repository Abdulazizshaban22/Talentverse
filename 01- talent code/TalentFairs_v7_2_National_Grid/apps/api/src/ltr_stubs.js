import { Router } from 'express'
import { osClient } from './opensearch_client.js'
export const ltr = Router()

// Initialize LTR feature store
ltr.post('/ltr/init', async (_req,res)=>{
  const r = await osClient.transport.request({ method:'PUT', path:'/_ltr' })
  res.json(r.body||{ok:true})
})

// Upload a simple featureset
ltr.post('/ltr/featureset/:name', async (req,res)=>{
  const name = req.params.name
  const body = {
    features: [
      { name:'title_bm25', params:['keywords'], template: { match: { title: '{{keywords}}' } } },
      { name:'text_bm25',  params:['keywords'], template: { match: { text:  '{{keywords}}' } } }
    ]
  }
  const r = await osClient.transport.request({ method:'PUT', path:`/_ltr/_featureset/${name}`, body })
  res.json(r.body||{ok:true})
})

// Execute SLTR (search + log features) — requires plugin installed
ltr.post('/ltr/search', async (req,res)=>{
  const { index='tf_posts@read', keywords='talent' } = req.body||{}
  const body = {
    query: {
      sltr: {
        _name: "logged_features",
        featureset: "tf_features",
        params: { keywords }
      }
    }
  }
  const r = await osClient.search({ index, body })
  res.json({ ok:true, hits: r.body.hits })
})
