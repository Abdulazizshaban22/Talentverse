# Talent Fairs — v2.2 Social+ (Web + API + Mobile + AI + Search + HLS + CI/CD)

Monorepo includes:
- Web (Next.js 14) — social feed + rewards + auth (NextAuth + Keycloak) + search
- Admin (Next.js) — basic admin
- Mobile (Expo RN) — login (PKCE) + social feed
- API (Express + Prisma) — posts/comments/likes/follow + rewards + media + search
- AI Core (FastAPI) — analyze text/image/audio
- AI Feed (FastAPI) — embeddings ingest/similar (pgvector-ready stubs)
- Search Indexer — OpenSearch Arabic analyzer + indexer
- Points Engine (Fastify + Redis)
- Notifier — Resend email + WhatsApp Cloud + Expo Push
- Media Worker — FFmpeg → HLS packaging
- Infra — docker-compose (dev), Terraform skeleton (ECS + ALB + CloudFront + ACM + OAC + WAF), GitHub Actions to ECR/ECS

## Quick Start (dev)
1) `cp .env.example .env` and update values
2) `docker compose -f infra/docker-compose.yml up -d db redis keycloak-db keycloak opensearch opensearch-dashboards`
3) Prisma: `pnpm --filter @talent/api prisma:generate`
4) API: `pnpm --filter @talent/api dev`
5) Web: `pnpm --filter @talent/web dev`
6) Indexer init: `pnpm --filter @talent/search-indexer run init` then `pnpm --filter @talent/search-indexer start`
