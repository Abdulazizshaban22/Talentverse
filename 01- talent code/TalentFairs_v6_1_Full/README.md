# TalentFairs v6.1 — Unified Full‑Stack Release

Monorepo مبسّط يجمع Web + API + Mobile + Terraform + Scripts. هذه النسخة صالحة للتشغيل المحلي فورًا،
ومجهزة للترقية إلى إنتاج (ECS/CloudFront/WAF/Keycloak/Nafath/Payments) عبر السكربتات وقوالب المتغيرات.

## تشغيل سريع (محلي)
```bash
# 1) API
cd apps/api
npm i
npm run dev   # http://localhost:4000

# 2) Web
cd ../../apps/web
npm i
npm run dev   # http://localhost:3000
```

## ربط المسارات الجديدة داخل الويب والـAPI
- AR Web: `/passport-ar` (يدعم Scene Viewer/Quick Look/WebXR) — يضرب `/loyalty/award` تلقائيًا للنقاط.
- EduTwin: `/edutwin/analytics` — يستدعي `/edutwin/metrics/engagement`.

## الإنتاج (ملخص)
- املأ `infra/prod.tfvars` و`env/.env.prod` بالقيم الواقعية ثم استخدم سكربتات `infra/scripts` (استيراد VPC Origin، ربط WAF).

> هذه النسخة لا تحتوي على Prisma schema كامل أو Dockerfiles تفصيلية لتقليل الحجم؛ لكنها جاهزة للإلحاق بمخططاتك السابقة.
