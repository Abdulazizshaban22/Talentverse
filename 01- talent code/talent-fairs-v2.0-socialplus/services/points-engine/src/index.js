import Fastify from 'fastify'
import Redis from 'ioredis'
const app=Fastify(); const redis=new Redis(process.env.REDIS_URL||'redis://localhost:6379')
app.get('/health', async()=>({ ok:true, service:'points-engine' }))
app.post('/award', async(req)=>{
  const { userId, delta, reason } = req.body||{}
  const key = `points:${userId}`
  const bal = await redis.incrby(key, Number(delta||0))
  await redis.lpush(`points:ledger:${userId}`, JSON.stringify({ delta, reason, at: Date.now() }))
  return { ok:true, userId, balance: bal }
})
const port = Number(process.env.PORT_POINTS||4100)
app.listen({ port }, (e,addr)=>{ if(e){app.log.error(e);process.exit(1)} console.log('Points on', addr) })
