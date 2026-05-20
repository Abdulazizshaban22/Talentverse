# Talent Fairs — v2.0 Social+ (Web + API + Mobile + AI + Realtime)

Monorepo includes:
- Web (Next.js 14) — social feed + rewards + auth (NextAuth + Keycloak)
- Admin (Next.js) — basic admin
- Mobile (Expo RN) — login (PKCE) + rewards + social feed
- API (NestJS + Prisma + Postgres + Redis) — social endpoints, rewards, media upload
- AI Core (FastAPI) — analyze text/image/audio
- AI Feed (FastAPI) — recommendations stub
- Points Engine (Fastify + Redis) — points/ledger
- Notifier — Resend email + WhatsApp Cloud
- Infra — docker-compose (dev), Terraform skeleton (ECS + ALB + CloudFront + ACM)

## Quick start (dev)
1) `cp .env.example .env` and update values
2) `docker compose -f infra/docker-compose.yml up -d db redis keycloak-db keycloak`
3) Prisma: `pnpm --filter @talent/api prisma:generate`
4) API: `pnpm --filter @talent/api dev`
5) Web: `pnpm --filter @talent/web dev`
6) Admin: `pnpm --filter @talent/admin dev`
7) Mobile: `pnpm --filter @talent/mobile start`

## v2.1 Expansion
- Redis Streams activity bus (XADD)
- Notifier HTTP (/email, /whatsapp)
- Push token register (/push/register)
- S3 presign endpoint (/media/presign)
- Terraform: WAF + S3 media skeleton
