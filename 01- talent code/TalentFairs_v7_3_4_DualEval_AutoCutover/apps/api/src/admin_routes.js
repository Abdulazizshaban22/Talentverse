
import { Router } from 'express'
import { spawn } from 'child_process'
import { setAlias } from './model_alias.js'
export const admin = Router()

function run(cmd, args, cwd, res){
  const p = spawn(cmd, args, { cwd, stdio:['ignore','pipe','pipe'] })
  let out=''; let err=''
  p.stdout.on('data', d=> out+=d.toString())
  p.stderr.on('data', d=> err+=d.toString())
  p.on('close', code => res.json({ ok: code===0, code, out, err }))
}

admin.post('/eval/dual', (req,res)=>{
  const { domain='posts', k='10' } = req.body||{}
  run('bash', ['ops/rank_eval_dual.sh', domain, String(k)], process.cwd()+'/../../', res)
})

admin.post('/cutover/auto', (req,res)=>{
  const { domain='posts', days='7', minGain='0.03' } = req.body||{}
  run('bash', ['ops/auto_cutover.sh', domain, String(days), String(minGain)], process.cwd()+'/../../', res)
})

admin.post('/alias/set', async (req,res)=>{
  const { alias, model } = req.body||{}
  if(!alias || !model) return res.status(400).json({ ok:false, error:'alias and model required'})
  const r = await setAlias(alias, model)
  res.json(r)
})
