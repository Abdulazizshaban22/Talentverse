
-- Multi-tenant core
create table if not exists tenants (
  id text primary key,
  name text not null,
  created_at timestamptz default now()
);

create table if not exists persons (
  id text primary key,
  tenant_id text not null references tenants(id),
  national_id_hash text,
  full_name text,
  email text,
  role text check (role in ('Student','Teacher','Guardian','Employer','Admin')),
  birthdate date,
  created_at timestamptz default now()
);

create table if not exists schools (
  id text primary key,
  tenant_id text not null references tenants(id),
  name text not null
);

create table if not exists classes (
  id text primary key,
  tenant_id text not null references tenants(id),
  school_id text references schools(id),
  title text,
  grade_level text,
  academic_session text
);

create table if not exists enrollments (
  id text primary key,
  tenant_id text not null references tenants(id),
  class_id text not null references classes(id),
  person_id text not null references persons(id),
  role text check (role in ('student','teacher')),
  started_at date, ended_at date
);

create table if not exists skills (
  id text primary key,
  tenant_id text not null references tenants(id),
  pref_label text not null,
  type text,
  source text default 'ESCO'
);

create table if not exists person_skills (
  person_id text references persons(id),
  skill_id text references skills(id),
  level text,
  evidence jsonb,
  updated_at timestamptz default now(),
  primary key (person_id, skill_id)
);

create table if not exists credentials (
  id text primary key,
  tenant_id text not null references tenants(id),
  person_id text references persons(id),
  type text,
  standard text,
  payload jsonb,
  issued_at timestamptz default now()
);

create table if not exists jobs (
  id text primary key,
  tenant_id text not null references tenants(id),
  employer_id text,
  title text,
  description text,
  esco_occupation text,
  created_at timestamptz default now()
);

create table if not exists applications (
  id text primary key,
  tenant_id text not null references tenants(id),
  job_id text references jobs(id),
  person_id text references persons(id),
  status text default 'submitted',
  created_at timestamptz default now()
);
