# Talent Fairs — Unified Monorepo v4.0
يجمع ميزات v3.2 / v3.3 / v3.4 / v4.0 في مستودع واحد، مع بنية سحابية Terraform (ECS + ALB + CloudFront + WAF) وCI.

## Quick Start (Local)
```bash
cp .env.example .env
pnpm --filter @talent/api prisma:generate
pnpm --filter @talent/api prisma:migrate

pnpm dev:api   # :4000
pnpm dev:web   # :3000
```

## AWS Deploy (Outline)
- infra/terraform: يشغّل ECS Fargate + ALB + CloudFront + WAF + ACM + SSM.
- اربط CloudFront بـ ALB كـ Origin واستخدم رأس سرّي لمنع الوصول المباشر للـALB.
- اربط WAF بالـCloudFront.
