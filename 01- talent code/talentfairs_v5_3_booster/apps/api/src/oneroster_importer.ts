// apps/api/src/oneroster_importer.ts
import { PrismaClient } from '@prisma/client'
import { parse } from 'csv-parse/sync'
const prisma = new PrismaClient()

export async function importOneRosterZip(zipPath: string){
  const AdmZip = (await import('adm-zip')).default
  const zip = new AdmZip(zipPath)
  const entries = zip.getEntries()
  const tables: Record<string, any[]> = {}
  for (const e of entries) {
    if (!e.entryName.toLowerCase().endsWith('.csv')) continue
    const name = e.entryName.split('/').pop()!.toLowerCase()
    const content = e.getData().toString('utf8')
    const records = parse(content, { columns: true, skip_empty_lines: true })
    tables[name] = records
  }
  for (const r of tables['orgs.csv'] || []) {
    await prisma.org.upsert({ where:{ sourcedId:r.sourcedId }, update:{ name:r.name }, create:{ sourcedId:r.sourcedId, name:r.name } })
  }
  for (const u of tables['users.csv'] || []) {
    await prisma.user.upsert({ where:{ sourcedId:u.sourcedId }, update:{ givenName:u.givenName, familyName:u.familyName, role:u.role },
      create:{ sourcedId:u.sourcedId, givenName:u.givenName, familyName:u.familyName, role:u.role, orgSourcedId:u.orgSourcedId } })
  }
  for (const c of tables['classes.csv'] || []) {
    await prisma.schoolClass.upsert({ where:{ sourcedId:c.sourcedId }, update:{ title:c.title, courseSourcedId:c.courseSourcedId },
      create:{ sourcedId:c.sourcedId, title:c.title, courseSourcedId:c.courseSourcedId } })
  }
  for (const e of tables['enrollments.csv'] || []) {
    await prisma.enrollment.upsert({ where:{ sourcedId:e.sourcedId }, update:{ role:e.role },
      create:{ sourcedId:e.sourcedId, userSourcedId:e.userSourcedId, classSourcedId:e.classSourcedId, role:e.role } })
  }
}
