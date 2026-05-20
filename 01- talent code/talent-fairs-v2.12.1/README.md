# Talent Fairs — v2.12.1
**Sector Rules Templates + LTR Dataset CSV Upload UI/API**

### ما الجديد؟
- **قوالب قواعد جاهزة** (Tech / Retail / Logistics) قابلة للتثبيت بزر واحد من `/admin/rules/templates`.
- **واجهة CSV للترتيب (LTR)**: صفحة `/admin/ranker/dataset` للصق/رفع CSV وتحويله إلى JSONL للتدريب (LightGBM LambdaRank).
- **نقاط API**:
  - `GET /admin/rules/templates` — عرض القوالب.
  - `POST /admin/rules/templates/install` — تثبيت قالب إلى قاعدة البيانات.
  - `POST /ranker/dataset/ingest` — إدخال CSV → إنشاء `data/rank/upload_*.jsonl`.
  - `POST /ranker/dataset/clear` — تنظيف مجلد البيانات.

> مراجع:
> - LightGBM LTR (LambdaRank/NDCG & group/query) — راجع التوثيق الرسمي. 
> - WhatsApp Cloud API (interactive/templates) عند الحاجة.
> - ESCO API للمهارات والمهن.
