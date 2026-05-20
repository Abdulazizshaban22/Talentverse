# Talent Fairs — Unified Monorepo (v1.0)

This repository contains Web (Next.js), Mobile (Expo), API (NestJS), AI Core (FastAPI), Points Engine (Fastify), and Terraform infra (AWS ECS + CloudFront + ACM).

## Quick start (dev)
1) Install deps: `pnpm i` (requires Node 20+ & pnpm 9+)
2) Copy `.env.example` to `.env` and fill values.
3) Start core services (DB/Redis/Keycloak): `docker compose -f infra/docker-compose.yml up -d db redis keycloak keycloak-db`
4) Run apps:
   - API: `pnpm --filter @talent/api dev`
   - Web: `pnpm --filter @talent/web dev`
   - Admin: `pnpm --filter @talent/admin dev`
   - Mobile: `pnpm --filter @talent/mobile start`

## Services
- apps/web (Next.js 14 App Router)
- apps/admin (Next.js dashboard)
- apps/mobile (Expo RN)
- services/api (NestJS + Prisma + Keycloak JWT)
- services/ai-core (FastAPI — analysis stubs)
- services/points-engine (Fastify — points & rewards)
- services/notifier (email/sms/whatsapp stubs)
- infra/docker-compose (dev) & infra/terraform (AWS go-live)

See each folder README for details.
