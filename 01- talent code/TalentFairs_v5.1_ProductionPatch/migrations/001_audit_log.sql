-- migrations/001_audit_log.sql
CREATE OR REPLACE FUNCTION forbid_update_delete()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'AuditLog is append-only';
END; $$;

DROP TRIGGER IF EXISTS auditlog_no_update ON "AuditLog";
CREATE TRIGGER auditlog_no_update BEFORE UPDATE OR DELETE ON "AuditLog"
FOR EACH ROW EXECUTE FUNCTION forbid_update_delete();
