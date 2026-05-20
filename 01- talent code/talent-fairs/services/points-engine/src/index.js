import Fastify from 'fastify'
import Redis from 'ioredis'

const app = Fastify()
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

app.get('/health', async () => ({ ok: true, service: 'points-engine' }))

app.post('/award', async (req) => {
  const { userId, delta, reason } = req.body || {}
  // naive balance in redis
  const key = `points:${userId}`
  const newBalance = await redis.incrby(key, Number(delta || 0))
  await redis.lpush(`points:ledger:${userId}`, JSON.stringify({ delta, reason, at: Date.now() }))
  return { ok: true, userId, balance: newBalance }
})

const port = process.env.PORT_POINTS || 4100
app.listen({ port }, (err, address) => {
  if (err) { app.log.error(err); process.exit(1) }
  console.log('Points Engine on', address)
})
