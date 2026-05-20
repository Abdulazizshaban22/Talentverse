
# Ingestion Connectors
- Endpoint: `POST /v1/ingest/csv` (service: ingestion) with form fields `dataset={school|university|sports}` and `file=@data.csv`.
- Maps columns automatically and upserts into `institution` / `sport_metric`.
