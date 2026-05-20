
# TALENTVERSE SA — Monorepo v1.0

> Generated on 2025-10-21. This repository contains a production-ready **MVP** scaffold for the national Talent Intelligence platform:
Web (Next.js), Admin (Next.js), Mobile (React Native/Expo), API Gateway (NestJS), AI Engines (FastAPI), ChallengeHub (NestJS),
shared UI/SDK, Postgres + pgvector schema, Helm charts, Terraform skeleton for AWS me-south-1, GitHub Actions CI, and Grafana dashboards.

## Quick Start (Dev)
- Install **pnpm** and **Node 20**. `corepack enable`
- `pnpm i`
- Copy `.env.example` to `.env` for each app/service and fill values.
- Start core services (local): `docker compose -f docker-compose.dev.yml up -d`
- Run web: `pnpm -C apps/web dev` • admin: `pnpm -C apps/admin dev` • API: `pnpm -C services/api-gateway start:dev`
- Run AI services: `uvicorn services.ai_talentmatch.main:app --reload --port 8010` (etc.)

## Tests & Coverage
- Backend (NestJS): `pnpm -C services/api-gateway test` (thresholds 75%).
- AI (FastAPI): `pytest --cov=.` with config in `pyproject.toml` (thresholds 75%).

## Deploy (K8s)
- Fill `infra/terraform/` (VPC/RDS/EKS/WAF) and apply.
- Bootstrap ArgoCD, then apply the **App-of-Apps** manifests in `infra/k8s/helm/app-of-apps/`.

## PDPL
- PDPL consent/DSR flows implemented at API-level, with tables in `data/migrations/000_init.sql`.
- Policy templates in `docs/pdpl/` for customization.
