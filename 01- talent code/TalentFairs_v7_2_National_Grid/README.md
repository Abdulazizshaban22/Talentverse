# TalentFairs v7.2 — National Grid (Go‑Live + Recommender + Multi‑Tenant)

هذه الحزمة تُكمل التنفيذ الفعلي لخيارات: **Go‑Live**، **توسيع الذكاء**، و**SaaS Multi‑Tenant**.
- Go‑Live: سكربت `go-live-prod.sh` يشغّل Bootstrap لـOpenSearch، يستورد IdP Nafath إلى Keycloak (Admin REST)، ويُسجّل Webhooks Tap/HyperPay مع اختبارات فورية.
- الذكاء: **Graph Ranker** (Neo4j GDS PageRank) + **OpenSearch LTR** stubs لتفعيل Fusion (Graph + LTR).
- Multi‑Tenant: وسيط يفرض استخراج الـtenant من الـsubdomain/الهيدرز ويطبّقه على Feed/Search/Jobs/Courses.

> متطلبّات: Node 18+, OpenSearch, Neo4j GDS, Keycloak، مفاتيح Tap/HyperPay، وإعداد DNS/Subdomains للمستأجرين.
