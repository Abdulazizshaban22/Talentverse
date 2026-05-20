
# TalentFairs v9.4 — National Mock Go‑Live
**هدف هذه الحزمة**: تجهيز تشغيل وطني (Mock) بدون أسرار حقيقية — مع بنية Terraform كاملة (ACM + CloudFront + WAF + ALB + ECS)، وتمكين Nafath (IdP قالب)، وربط HyperPay/Tap Webhooks، ومراقبة nDCG في Grafana.

> لاحقًا فقط غيّر القيم في `infra/terraform/prod.tfvars` وشغّل `bash go-live.sh`.

## تشغيل محلي سريع
```bash
cp .env.example .env
docker compose up -d --build
node search/bootstrap_opensearch.js
cd web && npm i && npm run dev
```

## إطلاق AWS (Mock)
```bash
cd infra/terraform
cp prod.tfvars.placeholder prod.tfvars
# عدّل prod.tfvars لاحقًا بقيمك الحقيقية
bash ../../scripts/go-live.sh
```
