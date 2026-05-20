
-- HNSW (cosine)
CREATE INDEX IF NOT EXISTS hnsw_emb_opp_v2 ON emb_opportunity_v2 USING hnsw (embedding vector_cosine_ops);
-- IVFFlat (cosine) with 1000 lists (tune)
CREATE INDEX IF NOT EXISTS ivfflat_emb_opp_v2 ON emb_opportunity_v2 USING ivfflat (embedding vector_cosine_ops) WITH (lists = 1000);
-- adjust probes per-session: SET ivfflat.probes = 10;
-- You can drop one to isolate:
-- DROP INDEX IF EXISTS hnsw_emb_opp_v2;
-- DROP INDEX IF EXISTS ivfflat_emb_opp_v2;
