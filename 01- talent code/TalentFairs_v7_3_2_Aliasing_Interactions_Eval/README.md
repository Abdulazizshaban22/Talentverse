# TalentFairs v7.3.2 — Model Aliasing + Real Interactions + Auto nDCG Eval

**يشمل:**
1) **Model aliasing** (مثل: `tf_ltr_posts@prod`) مع تدوير آمن للإصدارات (vN → vN+1) عبر مؤشر ميتاداتا في OpenSearch.  
2) **جداول تفاعلات حقيقية** (click / dwell / apply / enroll) لتوليد **judgments.tsv** بدل الهيورستك.  
3) **وظيفة تقييم آلية** تحفظ **nDCG@K** بعد كل تدريب في `metrics/history.jsonl` و`metrics/latest.json`.  

> يعتمد على OpenSearch LTR (SLTR: featureset+model) + Rank Eval API، وNeo4j GDS كما في 7.3.1.

## تشغيل سريع
```bash
# بيئة OpenSearch
export OPENSEARCH_NODE="https://<os-endpoint>"
export OPENSEARCH_AUTH="user:pass"   # إن لزم
export OPENSEARCH_SSL=true           # إن لزم

# Neo4j (إن استخدمت الـGraph)
export NEO4J_URI="bolt://localhost:7687"
export NEO4J_USER="neo4j"
export NEO4J_PASS="pass"

cd apps/api
npm i
node src/main.js   # http://localhost:4000/health
```

## إدارة alias للنماذج
```bash
# ضبط alias للإنتاج (مثال: posts@prod → tf_ltr_posts_xgb_v3)
node ops/model_alias_set.js posts@prod tf_ltr_posts_xgb_v3

# قراءة alias الحالي
node ops/model_alias_get.js posts@prod
```

## أوتو-تيون + تقييم nDCG
```bash
# توليد judgments من جدول التفاعلات الحقيقي (Postgres) أو CSV
python ops/judgments_from_interactions.py --domain posts --out data/ltr/judgments/posts.tsv   --pg "host=localhost dbname=tf user=postgres password=pass"

# تدريب + رفع + تقييم + حفظ النتائج
bash ops/auto_tune.sh posts
bash ops/rank_eval.sh posts 10   # nDCG@10
```

## REST Admin
- `POST /admin/ltr/alias/set {alias, model}`  
- `GET  /admin/ltr/alias/get?alias=posts@prod`  
- `POST /admin/ltr/retrain {domain}`  
- `POST /admin/ltr/eval {domain, k}`  → يحفظ nDCG@K في `metrics/history.jsonl`
