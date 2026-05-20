# Talent Fairs — v3.0 (Talent Genome Platform)
مدارس + ملف حياة (Life Profile) + Growth Graph + امتثال PDPL.

## Quick Start
```bash
cp .env.example .env
pnpm --filter @talent/api prisma:generate
pnpm --filter @talent/api prisma:migrate

pnpm dev:api   # :4000
pnpm dev:web   # :3000  (NEXT_PUBLIC_API_BASE=http://localhost:4000)
```
