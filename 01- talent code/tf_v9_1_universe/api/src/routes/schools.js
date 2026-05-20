
import { Router } from 'express'
import multer from 'multer'
import { parse } from 'csv-parse'
import fs from 'fs'
import { Client } from '@opensearch-project/opensearch'

export const router = Router()
const upload = multer({ dest: '/tmp' })
const client = new Client({ node: process.env.OPENSEARCH_NODE || 'http://localhost:9200' })

async function bulkIndex(index, rows){
  const ops = []
  for (const r of rows) { ops.push({ index:{ _index:index } }); ops.push(r) }
  if (ops.length) await client.bulk({ body: ops, refresh:'wait_for' })
}

router.post('/oneroster/upload', upload.single('file'), async (req,res)=>{
  const file = req.file?.path
  if (!file) return res.status(400).json({ ok:false, error:'NO_FILE' })
  const text = fs.readFileSync(file, 'utf8')
  const rows = []
  await new Promise((resolve,reject)=>{
    parse(text, { columns:true, trim:true }, (err, recs)=>{
      if (err) reject(err); else { rows.push(...recs); resolve() }
    })
  })
  // تخمين نوع الملف حسب الأعمدة
  const header = rows[0] ? Object.keys(rows[0]) : []
  let index = 'tf_people@prod'
  if (header.includes('classSourcedId')) index = 'tf_enrollments@prod'
  if (header.includes('courseSourcedId')) index = 'tf_classes@prod'
  if (header.includes('dateLastModified') and header.includes('startDate')) index = 'tf_academicSessions@prod'
  await bulkIndex(index, rows)
  res.json({ ok:true, index, imported: rows.length })
})
