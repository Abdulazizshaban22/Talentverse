import { Router } from 'express'
import multer from 'multer'
export const schoolRouter = Router()
const upload = multer({ storage: multer.memoryStorage() })
schoolRouter.post('/oneroster/upload', upload.single('file'), async (_req:any,res:any)=>{
  res.json({ ok:true, imported:true })
})
