# Talent Fairs — v2.4.2 (Admin Full + ESCO Seed + Job Ingestor + Messaging + Rewards + Feature CSV)

This package extends v2.4.1 with:
- **Admin Full**: CRUD endpoints + simple web pages for Jobs & Challenges.
- **ESCO Seed (from file)**: seed skills to DB from `samples/esco_sample.json`.
- **Job Ingestor (from file)**: load jobs from `samples/jobs.json`.
- **Direct Messaging**: Message model + inbox/send endpoints + web page.
- **Rewards**: Reward catalog + redemption flow (points decrement) + web page.
- **Feature CSV**: API to export simple training features for LTR (`/features/sample-csv`).

> Prereqs: Postgres, Prisma, Node 18+, OpenSearch (optional for search), Keycloak as before.
