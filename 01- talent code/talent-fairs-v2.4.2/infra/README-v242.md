## Run order (delta over v2.4.1)
1) Prisma
   pnpm --filter @talent/api prisma:generate
   pnpm --filter @talent/api prisma:migrate

2) Seed ESCO
   pnpm --filter @talent/esco-sync start    # uses samples/esco_sample.json

3) Ingest jobs
   pnpm --filter @talent/job-ingestor start # uses samples/jobs.json

4) Start API + Web
   pnpm --filter @talent/api dev
   pnpm --filter @talent/web dev

5) Features CSV (optional)
   GET http://localhost:4000/features/sample-csv
