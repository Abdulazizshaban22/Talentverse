import express from 'express'
import multer from 'multer'
import path from 'path'
import { PrismaClient } from '@prisma/client'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import Redis from 'ioredis'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const app = express()
app.use(express.json())
const prisma = new PrismaClient()
const redis = new Redis(process.env.REDIS_URL||'redis://localhost:6379')

// Static uploads
const __dirname = path.dirname((__filename as any))
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

// Auth middleware (Keycloak JWT via JWKS)
const jwks = createRemoteJWKSet(new URL(process.env.KEYCLOAK_JWKS_URL || 'http://localhost:8080/realms/talent/protocol/openid-connect/certs'))
const issuer = process.env.KEYCLOAK_ISSUER || 'http://localhost:8080/realms/talent'
async function auth(req:any,res:any,next:any){
  try{
    const raw = req.headers.authorization || ''
    const token = raw.startsWith('Bearer ') ? raw.slice(7) : null
    if(!token) throw new Error('No token')
    const { payload } = await jwtVerify(token, jwks, { issuer })
    req.user = { sub: payload.sub, email: payload.email }
    next()
  }catch(e){ res.status(401).json({ ok:false, error:'unauthorized' }) }
}

app.get('/health', (_req,res)=> res.json({ ok:true, service:'api' }))

// Rewards
app.get('/rewards', auth, async (_req,res)=>{
  res.json(await prisma.reward.findMany({ where:{ active:true } }))
})
app.post('/rewards/redeem', auth, async (req:any,res)=>{
  const { userId, rewardId } = req.body || {}
  const reward = await prisma.reward.findUnique({ where:{ id: rewardId } })
  if(!reward || !reward.active) return res.status(400).json({ ok:false, error:'Reward not available' })
  const user = await prisma.user.findUnique({ where:{ id: userId } })
  if(!user) return res.status(400).json({ ok:false, error:'User not found' })
  if((user.points||0) < reward.cost) return res.status(400).json({ ok:false, error:'Insufficient points' })
  if(reward.stock <= 0) return res.status(400).json({ ok:false, error:'Out of stock' })
  await prisma.$transaction([
    prisma.user.update({ where:{ id:userId }, data:{ points: { decrement: reward.cost } } }),
    prisma.reward.update({ where:{ id: rewardId }, data:{ stock: { decrement: 1 } } }),
    prisma.pointsLedger.create({ data:{ userId, delta: -reward.cost, reason: `redeem:${reward.title}` } })
  ])
  await emit('reward:redeem', { userId, rewardId })
  res.json({ ok:true })
})

// Posts
app.get('/posts', auth, async (_req,res)=>{
  const posts = await prisma.post.findMany({ orderBy:{ createdAt:'desc' }, take: 50 })
  res.json(posts)
})
app.post('/posts/create', auth, async (req:any,res)=>{
  const { text, mediaUrl, mediaType, tags } = req.body || {}
  const created = await prisma.post.create({ data: { authorId: req.user.sub, text, mediaUrl, mediaType, tags: tags||[] } })
  await emit('post:create', { id: created.id, authorId: req.user.sub })
  res.json(created)
})

// Feed (simple)
app.get('/feed', auth, async (req:any,res)=>{
  const userId = req.query.userId as string
  const followees = await prisma.follow.findMany({ where:{ followerId: userId } })
  const ids = followees.map(f=>f.followeeId)
  let posts = await prisma.post.findMany({ where: ids.length? { authorId: { in: ids } } : {}, orderBy:{ createdAt:'desc' }, take: 50 })
  if(!posts.length){
    posts = await prisma.post.findMany({ orderBy:{ createdAt:'desc' }, take: 50 })
  }
  res.json(posts)
})

// Likes
app.post('/likes/toggle', auth, async (req:any,res)=>{
  const { postId } = req.body
  const ex = await prisma.like.findFirst({ where:{ postId, userId: req.user.sub } })
  if(ex){ await prisma.like.delete({ where:{ id: ex.id } }); await emit('like:off', { postId, userId: req.user.sub }); return res.json({ ok:true, liked:false }) }
  await prisma.like.create({ data:{ postId, userId: req.user.sub } }); await emit('like:on', { postId, userId: req.user.sub });
  res.json({ ok:true, liked:true })
})

// Comments
app.get('/comments/:postId', auth, async (req:any,res)=>{
  const list = await prisma.comment.findMany({ where:{ postId: req.params.postId }, orderBy:{ createdAt:'asc' } })
  res.json(list)
})
app.post('/comments/add', auth, async (req:any,res)=>{
  const { postId, text } = req.body
  const c = await prisma.comment.create({ data:{ postId, authorId: req.user.sub, text } })
  await emit('comment:add', { id: c.id, postId, authorId: req.user.sub })
  res.json(c)
})

// Follow
app.post('/follow/toggle', auth, async (req:any,res)=>{
  const { userId } = req.body
  const me = req.user.sub
  const ex = await prisma.follow.findFirst({ where:{ followerId: me, followeeId: userId } })
  if(ex){ await prisma.follow.delete({ where:{ id: ex.id } }); await emit('follow:off', { followerId: me, followeeId: userId }); return res.json({ ok:true, following:false }) }
  await prisma.follow.create({ data:{ followerId: me, followeeId: userId } }); await emit('follow:on', { followerId: me, followeeId: userId });
  res.json({ ok:true, following:true })
})

// Upload (local)
const upload = multer({ storage: multer.diskStorage({ destination:'uploads', filename: (_r,f,cb)=> cb(null, Date.now()+'_'+f.originalname) }) })
app.post('/media/upload', auth, upload.single('file'), (req:any,res)=>{
  const url = '/uploads/' + req.file.filename
  res.json({ ok:true, url })
})

// S3 Presign (PUT)
app.get('/media/presign', auth, async (req:any,res)=>{
  const key = (req.query.key as string) || `${Date.now()}_${(req.query.name||'file')}`;
  const s3 = new S3Client({ region: process.env.AWS_REGION||'me-central-1' })
  const put = new PutObjectCommand({ Bucket: process.env.S3_BUCKET||'', Key: key, ContentType: req.query.type||'application/octet-stream' })
  const url = await getSignedUrl(s3, put, { expiresIn: 300 })
  res.json({ ok:true, url, key })
})

// Push token register
app.post('/push/register', auth, async (req:any,res)=>{
  const { token, platform } = req.body||{}
  if(!token) return res.status(400).json({ ok:false, error:'missing token' })
  await prisma.pushToken.upsert({ where:{ token }, update:{}, create:{ token, platform: platform||'unknown', userId: req.user.sub } })
  res.json({ ok:true })
})

// Helper: emit to Redis Stream
async function emit(evt:string, payload:any){
  try { await redis.xadd('activity', '*', 'event', evt, 'data', JSON.stringify(payload||{})) } catch(e) { console.error('stream error', e) }
}

const port = Number(process.env.PORT_API||4000)
app.listen(port, ()=> console.log('API listening on', port))
