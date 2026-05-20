import fetch from 'node-fetch'
const base = (process.env.ESCO_API_BASE||'https://ec.europa.eu/esco/api').replace(/\/$/,'')
const q = process.argv[2]||'software'
const url = `${base}/search?type=skill&text=${encodeURIComponent(q)}&limit=10`
const r = await fetch(url,{headers:{'Accept':'application/json'}})
const dj = await r.json()
console.log(JSON.stringify(dj._embedded?.results?.map(x=>({label:x.title||x.preferredLabel||x.label, id:x.uri||x.id})).slice(0,10), null, 2))
