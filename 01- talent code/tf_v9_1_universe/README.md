
# TalentFairs v9.1 — Next.js + Fusion Ranking + CI

يشمل:
- **Next.js (App Router)** لواجهات Feed / Jobs / Courses / Rewards / Recruiter.
- **Fusion Ranking** (LTR + Personalized PR عبر Neo4j) + nDCG@10 دوري مع Shadow.
- **Nafath/Keycloak**: قالب IdP + تحديث redirect URIs.
- **Payments**: توقيعات Tap/HyperPay + تحديث حالة الاشتراك/الدورة.
- **OneRoster ingest كامل** (users/classes/enrollments/academicSessions) + ESCO mapping مبدئي.
- **CI/CD** (staging → prod) مكمّل لحزم v8.1/8.2 (Terraform AWS).

## تشغيل محلي
```bash
cp .env.example .env
docker compose up -d --build        # يشغّل api + opensearch + neo4j
cd web && npm i && npm run dev      # واجهة Next.js على :3000
# تهيئة فهارس OpenSearch + Aliases + ILM/Shadow
node search/bootstrap_opensearch.js
```
