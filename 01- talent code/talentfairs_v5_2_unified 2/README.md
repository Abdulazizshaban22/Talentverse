# TalentFairs v5.2 — Unified Go‑Live Bundle

Monorepo سريع التشغيل يجمع: Web (Next.js) + API (Express/TS) + Prisma + Terraform + GitHub CI + Smoke Tests.
تم دمج طبقات Delight/Gaps/ProductionPatch/GoLive في حزمة واحدة.

## Quick start (local)
```bash
# API
cd apps/api && npm i && npm run build && npm run start

# Web (expects API at http://localhost:4000)
cd ../../apps/web && npm i && npm run dev
```
