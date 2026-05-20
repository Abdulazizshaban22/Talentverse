
# TalentFairs v7.3.3 — Shadow & Dashboard Go‑Live

يشمل:
1) **Shadow/Staging** عبر alias مزدوج: `{domain}@prod` و`{domain}@shadow` (posts|people|jobs|courses).
2) **تغذية ذاتية**: تسجيل استعلامات/تفاعلات الإنتاج + أخذ عينات لتغذية التدريب.
3) **Grafana Dashboard**: خط زمني **nDCG@K** لكل دومين ونموذج (prod/shadow).

## تشغيل سريع
```bash
# متغيرات البيئة
export OPENSEARCH_NODE="https://<os-endpoint>"
export OPENSEARCH_AUTH="user:pass"     # إن لزم
export OPENSEARCH_SSL=true             # إن لزم

# API
cd apps/api && npm i && node src/main.js   # http://localhost:4000/health
```

## إعداد alias
```bash
# ربط alias الإنتاج
node ops/model_alias_set.js posts@prod tf_ltr_posts_xgb_v3
# ربط alias الشادو (تجربة نموذج جديد)
node ops/model_alias_set.js posts@shadow tf_ltr_posts_xgb_v4
```

## استدعاء Shadow API
```bash
curl -XPOST http://localhost:4000/fusion/shadow/posts   -H "Content-Type: application/json" -H "x-tenant: public"   -d '{"q":"data engineer","viewerId":"user_123","top":20}'
# يعيد ترتيب prod للمستخدم، ويُسجّل ترتيب shadow داخليًا في فهرس tf_shadow_logs دون تأثير على المستخدم.
```

## تقييم nDCG وكتابة المتركس
```bash
# يولّد nDCG@10 لكلا (prod/shadow) ويكتب إلى tf_metrics_ndcg
bash ops/rank_eval_dual.sh posts 10
```

## لوحة Grafana
1) أضف **OpenSearch Datasource** يشير إلى كلاسترك.
2) استورد `dashboards/tf_ndcg_trend.json`.
3) ستحصل على خط زمني **nDCG@K** لكل من prod/shadow حسب المجال.
