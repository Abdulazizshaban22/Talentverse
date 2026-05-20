-- EduTwin basic models
CREATE TABLE IF NOT EXISTS "Event" (
  id TEXT PRIMARY KEY,
  ts TIMESTAMP NOT NULL DEFAULT NOW(),
  tenant_id TEXT NOT NULL DEFAULT 'public',
  learner_id TEXT NOT NULL,
  verb TEXT NOT NULL,
  object TEXT NOT NULL,
  value NUMERIC,
  context JSONB
);

CREATE TABLE IF NOT EXISTS "KpiSnapshot" (
  id TEXT PRIMARY KEY,
  ts DATE NOT NULL,
  tenant_id TEXT NOT NULL DEFAULT 'public',
  school_id TEXT,
  class_id TEXT,
  learner_id TEXT,
  metric TEXT NOT NULL,
  value NUMERIC NOT NULL,
  meta JSONB
);

CREATE INDEX IF NOT EXISTS idx_event_learner_ts ON "Event"(learner_id, ts);
CREATE INDEX IF NOT EXISTS idx_kpi_metric_ts ON "KpiSnapshot"(metric, ts);
