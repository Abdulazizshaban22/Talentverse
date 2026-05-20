
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { router as health } from './routes/health.js'
import { router as feed } from './routes/feed.js'
import { router as recruiter } from './routes/recruiter.js'
import { router as rewards } from './routes/rewards.js'
import { router as payments } from './routes/payments.js'
import { router as schools } from './routes/schools.js'
import { router as credentials } from './routes/credentials.js'

const app = express()
app.use(cors()); app.use(bodyParser.json({limit:'2mb'}))
app.use('/api/health', health)
app.use('/api/feed', feed)
app.use('/api/recruiter', recruiter)
app.use('/api/rewards', rewards)
app.use('/api/payments', payments)
app.use('/api/schools', schools)
app.use('/api/credentials', credentials)
const PORT = process.env.PORT || 4000
app.listen(PORT, ()=>console.log('API :'+PORT))
