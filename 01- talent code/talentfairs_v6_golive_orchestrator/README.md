# TalentFairs v6.0 — Go‑Live Orchestrator

تشغيل إطلاق إنتاجي موحّد فوق v5.4 (مع إضافات v5.5/5.6/6.0) — يشمل:
- بناء صور Web/API ودفعها إلى ECR
- Terraform (ECS + ALB Private + CloudFront + WAF) بملف `prod.tfvars`
- استيراد CloudFront VPC Origin وربط WAF (اختياري عبر سكربتات)
- فحوصات صحّة ومسارات API
- إعدادات EAS (iOS/Android) مبدئية

> **المتطلبات**: `aws` CLI v2، `terraform >= 1.6`، `docker`، `jq`، وصول IAM مناسب، وشهادة ACM في us-east-1 لنطاقك.
