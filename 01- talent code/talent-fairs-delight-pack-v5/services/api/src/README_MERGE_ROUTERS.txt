أضِف في services/api/src/main.ts بعد تهيئة app:
import { fusionRouter } from './ai_fusion_ranker'
import { whatifRouter } from './ai_whatif'
import { redactionRouter } from './privacy_redaction'
import { endorseRouter } from './social_endorsements'
import { scholarshipsRouter } from './scholarships_matcher'

app.use('/ai', fusionRouter)
app.use('/ai', whatifRouter)
app.use('/privacy', redactionRouter)
app.use('/social', endorseRouter)
app.use('/scholarships', scholarshipsRouter)
