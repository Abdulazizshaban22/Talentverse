// apps/api/src/oneroster_import_cli.ts
import { importOneRosterZip } from './oneroster_importer'
import path from 'path'

async function main() {
  const zip = process.argv[2]
  if (!zip) {
    console.error('Usage: ts-node src/oneroster_import_cli.ts /path/to/oneroster.zip')
    process.exit(1)
  }
  console.log('[OneRoster] Importing', zip)
  await importOneRosterZip(path.resolve(zip))
  console.log('Done.')
}
main().catch(e=>{ console.error(e); process.exit(1) })
