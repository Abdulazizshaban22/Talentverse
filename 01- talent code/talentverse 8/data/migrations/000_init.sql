
-- Enable pgvector for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS person(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  national_id TEXT,
  region TEXT,
  birthdate DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS guardian_consent(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID REFERENCES person(id) ON DELETE CASCADE,
  consent_given BOOLEAN NOT NULL,
  consent_at TIMESTAMPTZ DEFAULT now(),
  guardian_name TEXT,
  guardian_id TEXT
);

CREATE TABLE IF NOT EXISTS talent_profile(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID REFERENCES person(id) ON DELETE CASCADE,
  headline TEXT,
  bio TEXT
);

CREATE TABLE IF NOT EXISTS person_skill(
  person_id UUID REFERENCES person(id) ON DELETE CASCADE,
  skill TEXT,
  level INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS assessment_session(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID REFERENCES person(id) ON DELETE CASCADE,
  scores JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dsr_request(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID REFERENCES person(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- access/rectify/delete/consent-withdraw
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Embeddings tables
CREATE TABLE IF NOT EXISTS emb_person(
  person_id UUID PRIMARY KEY REFERENCES person(id) ON DELETE CASCADE,
  embedding vector(1536)
);
CREATE INDEX IF NOT EXISTS ivf_emb_person ON emb_person USING ivfflat (embedding vector_cosine_ops) WITH (lists=100);
