
async function getJobs(){
  const base = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000'
  const r = await fetch(base + '/api/recruiter/jobs', { cache:'no-store' })
  return r.json()
}
export default async function Jobs(){
  const jobs = await getJobs()
  return (<main><h2>Jobs</h2><pre>{JSON.stringify(jobs,null,2)}</pre></main>)
}
