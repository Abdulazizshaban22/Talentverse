# TalentFairs Add-ons — v5.5 → v6.0

## v5.5 — Talent Passport AR
- صفحة Web AR (`/passport-ar`) باستخدام `<model-viewer>` مع أوضاع: `webxr | scene-viewer | quick-look`.
- دعم iOS (USDZ عبر `ios-src`) وAndroid (Scene Viewer) مع fallback WebGL.
- مكافآت نقاط تلقائيًا عبر `/loyalty/award` عند بدء/إنهاء الجلسة.

## v5.6 — EduTwin Analytics
- واجهة إدخال أحداث تعليمية (xAPI/Caliper-like) عبر `/edutwin/ingest`.
- مؤشرات أولية `/edutwin/metrics/engagement` + صفحة `/edutwin/analytics`.
- مهاجرات Prisma: `Event`, `KpiSnapshot`.

## v6.0 — SaaS Multi‑Tenant Launch
- Middleware لاشتقاق المستأجر من الـsubdomain.
- حقول `tenant_id` + سياسات **RLS** في PostgreSQL لعزل المستأجرين.
- ملاحظات Terraform لشهادة wildcard ودعم DNS للمستأجرين.

### الدمج
- أضف الملفات على مستودع v5.4، ثم:
  - اربط الراوترات المذكورة في `main.patch.note.txt`.
  - طبّق مهاجرات SQL (`003_edutwin.sql` و`004_rls.sql`).

> تذكير: فعّل HTTPS و`xr-spatial-tracking` عند استخدام WebXR.
