
CREATE TABLE IF NOT EXISTS hr_employee(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  national_id TEXT UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  region TEXT,
  institution_id UUID,
  title TEXT,
  grade TEXT,
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS hr_performance(
  employee_nid TEXT,
  period TEXT,
  score NUMERIC,
  notes TEXT,
  PRIMARY KEY (employee_nid, period)
);
