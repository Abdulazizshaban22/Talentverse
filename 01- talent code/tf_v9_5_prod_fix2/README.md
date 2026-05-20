
# TalentFairs v9.5 — Production Ready (National Launch)
**Release Date:** 2025-11-10

هذه الحزمة جاهزة للإطلاق: **ACM(us-east-1) + CloudFront(OAC) + WAF + ALB + ECS + Route53 + SSM**،
مع **Keycloak/Nafath**، **Tap/HyperPay Webhooks**، **OpenSearch ILM/Rollover/Aliases + RankEval**، **Neo4j**، **Grafana**، و**CI/CD**.

## خطوات سريعة
1) عدِّل `infra/terraform/prod.tfvars` (region/root_domain/vpc/subnets).
2) استبدل placeholders في `.env.production.example` أو SSM.
3) للتشغيل المحلي: `docker compose up -d --build` ثم `node search/bootstrap_opensearch.js`.
4) للإطلاق على AWS: `bash scripts/go-live-prod.sh` (بعد تعبئة `prod.tfvars`).

> تذكير: شهادة CloudFront يجب أن تكون في **us-east-1**.
