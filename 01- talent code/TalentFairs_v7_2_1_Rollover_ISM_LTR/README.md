# TalentFairs v7.2.1 — Rollover + ISM + LTR Pipeline

هذه الحزمة تُضيف:
- **ISM (Index State Management)**: سياسات رولوڤر يومية/حجمية لمؤشرات الفيد والبحث، مع سكربتات تطبيق فورية.
- **Rollover الآن** إلى `*-000002` عبر سكربت جاهز لكل المؤشرات.
- **LTR Pipeline**: تهيئة مخزن LTR، إنشاء FeatureSets للأشخاص/الوظائف/الدورات، قوالب Logging للميزات، أمثلة **Judgments**، سكربت تدريب **XGBoost**، ورفع نموذج LTR.

> المتغيرات المطلوبة: `OPENSEARCH_NODE`, و(اختياريًا) `OPENSEARCH_AUTH`, `OPENSEARCH_SSL=true`.
> تأكد من أن aliases (`tf_*@write/read`) موجودة من إصدار 7.1.1/7.2 السابقة.
