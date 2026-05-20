-- Enable Row Level Security
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Org" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SchoolClass" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Enrollment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Event" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "KpiSnapshot" ENABLE ROW LEVEL SECURITY;

-- Create a function to fetch tenant from JWT/setting (demo: uses current_setting)
CREATE OR REPLACE FUNCTION app_current_tenant() RETURNS text LANGUAGE sql STABLE AS $$
  SELECT current_setting('app.tenant', true);
$$;

-- Example policy: tenant isolation by app.tenant
DO $$
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename IN
    ('User','Org','SchoolClass','Enrollment','AuditLog','Event','KpiSnapshot')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS tenant_iso ON "%I"', t);
    EXECUTE format('CREATE POLICY tenant_iso ON "%I" USING (tenant_id = app_current_tenant()) WITH CHECK (tenant_id = app_current_tenant())', t);
  END LOOP;
END$$;
