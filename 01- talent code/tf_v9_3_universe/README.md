
# TalentFairs v9.3 — ACL + Dashboards + REST/ESCO + Polished RTL UI

يشمل:
- **Polished RTL UI** (Next.js App Router + Framer Motion): تحسين Feed/Jobs/Recruiter.
- **WebSockets ACL** (Socket.IO + JWT) مع **Keycloak Roles** لحماية قنوات chat/recruiter/feed.
- **RankEval Dashboard** في Grafana (nDCG prod vs shadow أسبوعيًا) + Provisioning جاهز.
- **OneRoster REST** إلى جانب CSV، مع **ESCO Mapping** لتطبيع المهارات.
- **Payments Production**: Tap/HyperPay HMAC verification + حالة اشتراك/دورة.

## تشغيل محلي
```bash
cp .env.example .env
docker compose up -d --build
node search/bootstrap_opensearch.js
cd web && npm i && npm run dev
```
