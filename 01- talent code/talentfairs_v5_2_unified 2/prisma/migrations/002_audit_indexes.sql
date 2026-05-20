-- prisma/migrations/002_audit_indexes.sql
CREATE INDEX IF NOT EXISTS idx_audit_ts ON "AuditLog"(ts);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON "AuditLog"(actorId);
CREATE INDEX IF NOT EXISTS idx_audit_action ON "AuditLog"(action);
