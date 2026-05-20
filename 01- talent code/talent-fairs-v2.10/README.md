# Talent Fairs — v2.10
**Admin Jobs & Challenges + Europass/HR‑XML Export + WhatsApp/Resend Notifications + Terraform ACM/CloudFront**

## Quick start
1) Copy `.env.example` → `.env` and add secrets & ARNs.
2) DB: `pnpm --filter @talent/api prisma:generate && pnpm --filter @talent/api prisma:migrate`
3) Run: `pnpm dev:api` then `pnpm dev:web`.

### New in v2.10
- **/admin/jobs & /admin/challenges**: لوحة إدارة كاملة (ويب) + REST in API.
- **Exports**: `GET /export/europass/:userId` (JSON) و`GET /export/hrxml/:userId` (XML) — خريطة أساسية قابلة للتوسعة.
- **Notifications**: `POST /notify/email` (Resend) + `POST /notify/whatsapp` (+ Webhook Verify/Receive).
- **Terraform**: ACM (us-east-1) + CloudFront أمام ALB/ECS، مع DNS validation عبر Route53.

> ملاحظة: مخططات Europass/HR Open معقدة؛ هذه النسخة تغطي الحقول الأكثر شيوعًا ويمكن توسيعها حسب الحاجة.
