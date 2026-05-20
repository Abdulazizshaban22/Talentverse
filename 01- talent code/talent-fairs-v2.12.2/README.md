# Talent Fairs — v2.12.2
**Rule Packs (Healthcare/FinTech/Construction) + Dataset Stats (NDCG@k, Coverage) + One‑click Train (LightGBM)**

## جديد الإصدار
- **Rule Packs قطاعية:** `/admin/rules/packs` لتثبيت قوالب جاهزة (Healthcare/FinTech/Construction).
- **إحصاءات Dataset:** `/admin/ranker/dataset` تعرض **NDCG@5/@10** وتغطية المجموعات (نسبة المجموعات التي تحوي تمييزًا إيجابيًا) بعد إدخال CSV.
- **زر تدريب سريع:** `POST /ranker/train` يشغّل سكربت LightGBM (إن كانت البيئة مجهّزة) ويكتب النموذج إلى `models/ranker/model.txt`، وإلا يعيد إرشادات التشغيل.

## CSV
صيغة الأعمدة: `qid,label,f1,f2,...,score?` — إن لم تُوفَّر **score** تُحسَب تلقائيًا كـ `sum(f*)` لأغراض الإحصاء الأولية.
