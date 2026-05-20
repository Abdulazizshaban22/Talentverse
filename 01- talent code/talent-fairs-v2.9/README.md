# Talent Fairs — v2.9
**AuthZ (Keycloak Authorization Services) + GDS Pipeline (PageRank) + Wallets (Google Pay via Tap / mada) + Alerts (Grafana/Alertmanager)**

## Quick start
1) Copy `.env.example` to `.env` and set secrets.  
2) `pnpm --filter @talent/api prisma:generate && pnpm --filter @talent/api prisma:migrate`  
3) `pnpm dev:api` then `pnpm dev:web`.

### What's new in v2.9
- **AuthZ**: Channel resources/scopes with UMA/RPT support. Admin sync script included.
- **GDS Pipeline**: job graph PageRank compute + property writeback automated.
- **Wallets**: Google Pay (via Tap) + mada flows; webhooks wired (Tap/HyperPay).
- **Alerts**: Prometheus rules + Alertmanager config + Grafana contact points provisioning.
