# TalentFairs v7.3 — Fusion Graph + LTR Engine

يجمع هذا الإصدار بين:
- **Neo4j GDS PageRank** (درجة الصلة/الأهمية من الرسم البياني).
- **OpenSearch LTR (SLTR)** (درجة الجودة/الملاءمة المستفادة من الميزات + النموذج).
- **اندماج (Fusion)** بخليط أوزان قابل للضبط تلقائيًا (Tuner).
- **Presence helpers** للـRealtime (Socket.IO) لعدّ المتصلين لكل مستخدم/قناة.
- **Tenancy**: جميع الاستعلامات تلتزم `tenantId` تلقائيًا.

## التشغيل السريع
1) اضبط بيئة الوصول لـ OpenSearch + Neo4j:
```
export OPENSEARCH_NODE=https://<endpoint>
export OPENSEARCH_AUTH=user:pass   # إن لزم
export OPENSEARCH_SSL=true         # إن لزم
export NEO4J_URI=bolt://localhost:7687
export NEO4J_USER=neo4j
export NEO4J_PASS=pass
```

2) شغّل الـAPI:
```
cd apps/api
npm i
node src/main.js   # http://localhost:4000
```

3) جرّب الاندماج:
```
# بحث أشخاص مدمج (Graph + LTR)
curl -XPOST http://localhost:4000/fusion/people -H "Content-Type: application/json" -H "x-tenant: public"   -d '{"q":"data engineer","viewerId":"user_123","top":20}'
```

## المحتوى
- `apps/api/src/fusion_config.js` — أوزان الاندماج الافتراضية + حدود القص.
- `apps/api/src/os_ltr.js` — استدعاء SLTR من OpenSearch (مع fallback BM25).
- `apps/api/src/graph_scores.js` — إرجاع graphScore من Neo4j (PageRank/Personalized).
- `apps/api/src/fusion_routes.js` — نقاط `/fusion/people|jobs|posts`.
- `apps/api/src/tenancy_middleware.js` — استخراج tenant (header/subdomain).
- `ops/tune_weights.py` — منضبط أوزان بسيط (grid/ndcg@k) باستخدام judgments.
- `apps/realtime/presence_example.js` — مثال Presence باستخدام Socket.IO.
