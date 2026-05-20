
CREATE TABLE IF NOT EXISTS institution(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  region TEXT,
  type TEXT CHECK (type IN ('school','university','academy')) DEFAULT 'school',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS consent_log(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID REFERENCES person(id) ON DELETE CASCADE,
  channel TEXT, -- web/mobile/admin
  scope TEXT,   -- pdpl-consent
  granted BOOLEAN,
  at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ab_event(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT,
  engine TEXT,  -- v1 (simple) | v2 (NER+Emb)
  input JSONB,
  output JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_event(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor TEXT,
  action TEXT,
  target TEXT,
  data JSONB,
  at TIMESTAMPTZ DEFAULT now()
);
