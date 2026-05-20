import { spawn } from 'node:child_process'
import chokidar from 'chokidar'
import fs from 'node:fs'
import path from 'node:path'

const IN = process.env.MEDIA_IN || path.resolve('uploads','incoming')
const OUT = process.env.MEDIA_OUT || path.resolve('uploads','hls')
fs.mkdirSync(IN, { recursive: true })
fs.mkdirSync(OUT, { recursive: true })

function transcode(input){
  const id = path.parse(input).name
  const outDir = path.join(OUT, id)
  fs.mkdirSync(outDir, { recursive: true })
  const args = ['-i', input,
    '-profile:v','baseline','-level','3.0','-start_number','0','-hls_time','6','-hls_list_size','0',
    '-f','hls', path.join(outDir,'index.m3u8')
  ]
  console.log('ffmpeg', args.join(' '))
  const ff = spawn('ffmpeg', args, { stdio: 'inherit' })
  ff.on('close', (code)=> console.log('ffmpeg closed', code))
}

chokidar.watch(IN, { ignoreInitial: false }).on('add', p=>{
  if(/\.(mp4|mov|m4v)$/i.test(p)) transcode(p)
})
console.log('Media worker watching', IN)
