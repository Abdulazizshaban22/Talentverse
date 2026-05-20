# Talent Fairs — v2.11
**Admin Applicants & Screening + ESCO Sync + LTR Tuning UI + WhatsApp Templates (multi‑lang) + CloudFront WAF/OAC**

## Quick start
1) Copy `.env.example` → `.env` and add secrets & ARNs.
2) DB: `pnpm --filter @talent/api prisma:generate && pnpm --filter @talent/api prisma:migrate`
3) Run: `pnpm dev:api` then `pnpm dev:web`.

### New in v2.11
- **Applicants & Screening:** لوحة `/admin/applicants` لإدارة الطلبات + نموذج تقييم (skills/experience/culture) وتغيير الحالة.
- **ESCO Sync:** خدمة `services/esco-sync/` لجلب المهارات/المهن من ESCO وتخزينها (Skill.escoId).
- **LTR Tuning UI:** صفحة `/admin/ranker` لضبط الأوزان W_graph/W_LTR وتدريب/محاكاة سريعة.
- **WhatsApp Templates:** `POST /notify/whatsapp/template` لإرسال رسائل قالبية مع `language_code` متعدد اللغات.
- **CloudFront WAF/OAC:** Terraform يُضيف Web ACL (ManagedRuleGroups) + S3 Origin بــ OAC للويب الستاتيكي؛ ALB يبقى خلف CloudFront مع Header سري.
