
# TalentFairs v7.3.4 — Dual Eval + Auto Cutover

يشمل:
1) **Dual Rank-Eval**: تقييم nDCG@K لنموذجي **prod** و**shadow** وكتابة النتيجة لكلاهما إلى فهرس `tf_metrics_ndcg`.
2) **Auto Cutover**: قلب alias `@prod` تلقائيًا للنموذج الخاص بـ`@shadow` إذا تفوّق **shadow** بمعدل **(+Δ >= MIN_GAIN)** لمدة **N أيام**.
3) **Smart Sampling**: مزج عينات من سجلات الاستعلام (`tf_shadow_logs`) + `random_score` لإثراء الأحكام وتجنب التحيز.
4) **Grafana Alert**: قاعدة تنبيه جاهزة تراقب الفارق بين shadow وprod أسبوعيًا.

## متغيرات البيئة المشتركة
```bash
export OPENSEARCH_NODE="https://<os-endpoint>"
export OPENSEARCH_AUTH="user:pass"   # إن لزم
export OPENSEARCH_SSL=true           # إن لزم
export OS_MODEL_ALIAS_INDEX="tf_meta_model_aliases"
export OS_METRICS_IDX="tf_metrics_ndcg"
export OS_SHADOW_LOGS_IDX="tf_shadow_logs"
# Aliases للقراءة
export OS_ALIAS_POSTS_R="tf_posts@read"
export OS_ALIAS_PEOPLE_R="tf_people@read"
export OS_ALIAS_JOBS_R="tf_jobs@read"
export OS_ALIAS_COURSES_R="tf_courses@read"
```

## الأوامر السريعة
```bash
# 1) أخذ عيّنات ذكية لإثراء judgments (اختياري)
node ops/sampling_mix.js posts 200  # (domain, howMany)

# 2) تقييم مزدوج prod/shadow وكتابة النتائج (nDCG@K) إلى tf_metrics_ndcg
bash ops/rank_eval_dual.sh posts 10

# 3) Cutover تلقائي (7 أيام, MIN_GAIN=0.03 أي +3%):
bash ops/auto_cutover.sh posts 7 0.03

# 4) REST (اختياري): شغّل API ثم:
# POST /admin/eval/dual {domain,k}
# POST /admin/cutover/auto {domain, days, minGain}
```
