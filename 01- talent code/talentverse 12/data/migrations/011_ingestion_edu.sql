
CREATE TABLE IF NOT EXISTS edu_student(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  national_id TEXT UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  region TEXT,
  institution_id UUID,
  college TEXT,
  major TEXT,
  gpa NUMERIC,
  level INT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS edu_program(
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  institution_id UUID,
  level TEXT,
  skills TEXT[]
);
CREATE TABLE IF NOT EXISTS edu_enrollment(
  student_id UUID REFERENCES edu_student(id) ON DELETE CASCADE,
  program_code TEXT REFERENCES edu_program(code) ON DELETE CASCADE,
  status TEXT,
  PRIMARY KEY (student_id, program_code)
);
