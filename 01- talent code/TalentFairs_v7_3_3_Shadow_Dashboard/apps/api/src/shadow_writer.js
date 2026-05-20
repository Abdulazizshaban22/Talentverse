
import { osClient } from './os_client.js'
const INDEX = process.env.OS_SHADOW_LOGS_IDX || 'tf_shadow_logs'

export async function writeShadowLog(doc){
  await osClient.indices.create({ index: INDEX }, { ignore: [400] })
  await osClient.index({ index: INDEX, refresh: 'false', body: { '@timestamp': new Date(doc.ts).toISOString(), **doc } })
}
