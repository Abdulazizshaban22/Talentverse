// services/api/src/oneroster/import_csv.ts
import fs from "fs";
import path from "path";
import zlib from "zlib";
import { parse } from "csv-parse/sync";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * Accepts a ZIP folder with OneRoster 1.2 CSVs (users.csv, classes.csv, enrollments.csv, orgs.csv, courses.csv).
 * Minimal mapping for students/teachers/classes/enrollments.
 */
export async function importOneRosterZip(zipPath: string) {
  const AdmZip = (await import("adm-zip")).default;
  const zip = new AdmZip(zipPath);
  const entries = zip.getEntries();
  const tables: Record<string, any[]> = {};
  for (const e of entries) {
    if (!e.entryName.endsWith(".csv")) continue;
    const name = path.basename(e.entryName).toLowerCase();
    const content = e.getData().toString("utf8");
    const records = parse(content, { columns: true, skip_empty_lines: true });
    tables[name] = records;
  }
  // Orgs
  for (const r of tables["orgs.csv"] || []) {
    await prisma.org.upsert({ where: { sourcedId: r.sourcedId }, update: { name: r.name }, create: { sourcedId: r.sourcedId, name: r.name }});
  }
  // Users
  for (const u of tables["users.csv"] || []) {
    await prisma.user.upsert({
      where: { sourcedId: u.sourcedId },
      update: { givenName: u.givenName, familyName: u.familyName, role: u.role },
      create: { sourcedId: u.sourcedId, givenName: u.givenName, familyName: u.familyName, role: u.role, orgSourcedId: u.orgSourcedId }
    });
  }
  // Classes
  for (const c of tables["classes.csv"] || []) {
    await prisma.schoolClass.upsert({
      where: { sourcedId: c.sourcedId },
      update: { title: c.title, courseSourcedId: c.courseSourcedId },
      create: { sourcedId: c.sourcedId, title: c.title, courseSourcedId: c.courseSourcedId }
    });
  }
  // Enrollments
  for (const e of tables["enrollments.csv"] || []) {
    await prisma.enrollment.upsert({
      where: { sourcedId: e.sourcedId },
      update: { role: e.role },
      create: { sourcedId: e.sourcedId, userSourcedId: e.userSourcedId, classSourcedId: e.classSourcedId, role: e.role }
    });
  }
}
