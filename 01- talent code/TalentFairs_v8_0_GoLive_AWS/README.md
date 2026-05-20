
# TalentFairs v8.0 — Go‑Live (AWS ECS + ALB + CloudFront + WAF)

هذه الحزمة تُشغِّل المنصة وطنيًا على AWS:
- **ECS Fargate** لخدمتي **API** و**Web**.
- **ALB** لمسارات `/api/*` و`/*`.
- **CloudFront** أمام ALB مع WAFv2.
- **ACM**: شهادة في **us-east-1** لـ CloudFront وأخرى في منطقة التطبيق لـ ALB.
- **SSM Parameter Store** للأسرار (Nafath/Keycloak/HyperPay/Tap/Resend/OpenSearch/Neo4j).

> بدّل القيم في `infra/terraform/app/terraform.tfvars` ثم شغّل `scripts/go-live-prod.sh`.

## الخدمات
- `services/api` : API مصغّر (Express) مع `/health` + نقاط تمهيد OpenSearch (bootstrap).
- `services/web` : Web مصغّر (Express static) — استبدله بواجهة الإنتاج لاحقًا.
- `infra/terraform` : ملفات Terraform (VPC، ECS، ECR، ALB، CloudFront، WAF، SSM).
- `.github/workflows` : نشر صور Docker إلى ECR وتشغيل Terraform عبر OIDC.

## أوامر مختصرة
```bash
# 1) تهيئة البنية + دفع صور ECR (يدويًا محليًا أو عبر GitHub Actions)
bash scripts/build_and_push_ecr.sh

# 2) تشغيل Terraform للإنتاج
bash scripts/go-live-prod.sh

# 3) Bootstrap OpenSearch (فهارس/ILM/aliases) + تعيين model aliases
bash scripts/bootstrap_opensearch.sh

# 4) اختبار الصحة
curl -s https://<DOMAIN>/api/health
```
