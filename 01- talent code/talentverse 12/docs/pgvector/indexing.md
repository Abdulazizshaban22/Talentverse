
# pgvector Indexing: HNSW vs IVFFlat

## HNSW (higher recall, more RAM, slower build)
```
CREATE INDEX IF NOT EXISTS hnsw_emb_opp_v2 ON emb_opportunity_v2 USING hnsw (embedding vector_cosine_ops);
```
- لا يحتاج تدريب مسبق.

## IVFFlat (أخف، أسرع بناءً، تقريبية)
```
CREATE INDEX IF NOT EXISTS ivfflat_emb_opp_v2 ON emb_opportunity_v2 USING ivfflat (embedding vector_cosine_ops) WITH (lists = 1000);
-- ضبط probes (افتراضي 1) لتحسين الاسترجاع
SET ivfflat.probes = 10;
```
- اختر `lists` و `probes` وفق حجم البيانات ومتطلبات التأخير/الدقّة.
