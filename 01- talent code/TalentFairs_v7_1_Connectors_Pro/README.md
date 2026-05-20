# TalentFairs v7.1 — Connectors Pro

هذه الحزمة تُنفّذ الربط الفوري المطلوب:
- **OpenSearch** للـFeed والبحث (فهرسة/استعلام).
- **WebSockets** (Socket.IO): Presence + Typing + قنوات ACL.
- **HyperPay / Tap** لبيع الدورات والاشتراكات (Charges + Webhooks).
- **Nafath Seal** على الملفات الشخصية + عرض **Open Badges**.

> تُنسخ مجلدات `apps` فوق إصدارك v6.2/v7.0 (أو تعمل مستقلة كنواة).

## تشغيل محلي سريع
```bash
# 1) API
cd apps/api && npm i && npm run dev   # http://localhost:4000

# 2) Web
cd ../../apps/web && npm i && npm run dev  # http://localhost:3000
```
اضبط متغيرات البيئة في `env/.env.sample` ثم انسخها إلى `.env`.

## إنتاج (ملخص)
- أنشئ OpenSearch مُدار (أو ذاتي) واضبط `OPENSEARCH_NODE` و`OPENSEARCH_AUTH`.
- اربط GitHub Actions → AWS OIDC كما في v6.2.
- فعّل الـWebhooks لــTap/HyperPay على نطاق API.
