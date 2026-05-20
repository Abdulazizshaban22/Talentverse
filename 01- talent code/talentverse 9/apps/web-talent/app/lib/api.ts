
export async function apiGet(path: string){
  const res = await fetch(`/api/proxy/${path}`, { cache: 'no-store' })
  if(!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}
export async function apiPost(path: string, payload: any){
  const res = await fetch(`/api/proxy/${path}`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload), cache: 'no-store' })
  if(!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}
