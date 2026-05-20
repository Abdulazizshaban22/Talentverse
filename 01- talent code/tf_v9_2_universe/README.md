
# TalentFairs v9.2 — Recruiter Console + RankEval + Realtime + RTL

يشمل:
- **Recruiter Console** كاملة (Jobs / Applicants / Match / Analytics).
- **RankEval Suite**: جمع أحكام، nDCG@10، Rank Eval مع OpenSearch، Shadow/Prod aliases.
- **Realtime** عبر WebSockets/Socket.IO: Presence + Typing + Feed Updates + Recruiter Alerts.
- **Arabic RTL Design** لواجهة Next.js (App Router).
- **OneRoster ingest** (CSV) وEuropass/OpenBadges وKeycloak/Nafath قوالب.

## تشغيل محلي
```bash
cp .env.example .env
docker compose up -d --build
# تهيئة OpenSearch (aliases prod/shadow + ILM)
node search/bootstrap_opensearch.js

# واجهة Next.js
cd web && npm i && npm run dev
```
