
# A/B: HNSW vs IVFFlat (pgvector)
1) Create both indexes (or each separately):
```sql
\i scripts/bench/index_setup.sql
```
2) Set probes (IVFFlat only):
```sql
SET ivfflat.probes = 10;
```
3) Run harness:
```bash
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/talentverse
python scripts/bench/pgvector_ab.py NQ=200 TOPK=10 PROBES=10
```
Outputs p50/p95 latency (ms) and Recall@K.
