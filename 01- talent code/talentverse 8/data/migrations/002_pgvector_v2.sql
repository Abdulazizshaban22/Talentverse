CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS emb_person_v2(
  person_id UUID PRIMARY KEY REFERENCES person(id) ON DELETE CASCADE,
  embedding vector(768)
);
CREATE INDEX IF NOT EXISTS hnsw_emb_person_v2 ON emb_person_v2 USING hnsw (embedding vector_cosine_ops);

CREATE TABLE IF NOT EXISTS emb_opportunity_v2(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  tags TEXT[],
  embedding vector(768)
);
CREATE INDEX IF NOT EXISTS hnsw_emb_opp_v2 ON emb_opportunity_v2 USING hnsw (embedding vector_cosine_ops);
