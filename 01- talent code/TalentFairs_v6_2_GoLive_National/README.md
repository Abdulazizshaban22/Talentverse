# TalentFairs v6.2 — Go‑Live National 🇸🇦

حزمة إنتاجية موحّدة لتشغيل تالنت فيرس على مستوى وطني (Multi‑Tenant).
تتضمن الويب + API + الموبايل + Terraform + CI/CD + SSO (Keycloak/Nafath) + حماية WAF + VPC Origin.

## تشغيل فوري (محلي)
```bash
# API
cd apps/api && npm i && npm run dev  # http://localhost:4000

# Web
cd ../../apps/web && npm i && npm run dev  # http://localhost:3000
```

## إطلاق وطني (ملخص)
1) املأ `infra/prod.tfvars` و`env/.env.prod` و`github/SECRETS_REQUIRED.md`.
2) أنشئ مستودعات ECR (أو استخدم `create_ecr.sh`).
3) نفّذ: `./deploy/go-live.sh /path/to/this/folder`.
4) (اختياري) استورد VPC Origin واربط WAF: `./deploy/cf_import.sh` + `./deploy/cf_attach_waf.sh`.
5) ابنِ iOS/Android عبر EAS: `eas build -p ios|android`.

> تذكير: شهادة CloudFront **يجب** أن تكون في **us-east-1**. (انظر المراجع في نهاية README).
