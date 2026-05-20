# Talent Fairs — v3.1
**SIS Connectors (OneRoster CSV) + Neo4j GDS (PageRank) + Guardian Mobile (Expo)**

## Quick start
```bash
cp .env.example .env
pnpm --filter @talent/api prisma:generate
pnpm --filter @talent/api prisma:migrate

pnpm dev:api   # :4000
pnpm dev:web   # :3000

# Mobile (Expo):
cd apps/guardian-app
pnpm i
pnpm start
```
