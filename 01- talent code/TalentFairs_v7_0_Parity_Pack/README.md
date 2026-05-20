# TalentFairs v7.0 — Competitor Parity Pack (LinkedIn + Coursera)

هذه الحزمة تُضيف طبقات "سوشيال" + "سوق تعلّم" + "Recruiter Suite" فوق النسخ المسلّمة (v6.x).
> الهدف: الوصول لندّية ميزات مع LinkedIn/Coursera + عناصر تفوّق محلية (Nafath/ESCO/AR/Talent Passport).

## ما الجديد؟
- **Social Graph**: متابعة/اتصالات (follow/connect) + توصيات اتصال + Endorsements.
- **Feed**: نشر/تعليقات/إعجاب + ترتيب ذكي (affinity × quality × freshness).
- **Messaging (stub)**: إنشاء محادثات + رسائل (جاهزة لتوصيل WebSocket).
- **Company Pages + Groups**: صفحات الشركات والمجموعات مع صلاحيات الإدارة والمحتوى.
- **Recruiter Suite**: باحث مرشح، فلاتر متقدّمة، حفظ بحث، ملاحظات على المرشّح.
- **Jobs++**: تحسين وظائف الإعلان، نماذج أسئلة، تتبّع التحويل، إحالات داخلية.
- **Learning Marketplace**: كورسات/مسارات/دروس/اختبارات + LTI 1.3 (stub) + SCORM/xAPI (ingest stub).
- **Credentials**: Open Badges (JSON-LD issuer stub) + Verifiable Credential (template) + دمج ESCO.
- **Search (stub)**: فهرسة أشخاص/وظائف/منشورات/كورسات (جاهزة للترقية إلى OpenSearch).
- **Trust & Safety**: سياسات تبليغ/إخفاء/حذف + سجل تدقيق أساسي.

## تشغيل محلي (ملخص)
- هذه الحزمة تقدّم **كودًا إضافيًا** فقط. اربط المسارات بواجهة/خادمك v6.x.
- المسارات تُنشر تحت `/social/*`, `/recruiter/*`, `/lms/*`, `/credentials/*`, `/search/*`.

> بعد الدمج، جرّب مجموعة Postman: `postman/TalentFairs_v7.0.postman_collection.json`.
