-- Real interactions table (PostgreSQL)
create table if not exists interactions (
  id bigserial primary key,
  occurred_at timestamptz not null default now(),
  user_id text not null,
  tenant_id text not null default 'public',
  domain text not null check (domain in ('posts','people','jobs','courses')),
  doc_id text not null,
  action text not null check (action in ('click','dwell','like','comment','apply','enroll')),
  dwell_ms int default 0,
  weight numeric default 1
);
create index if not exists idx_interactions_lookup on interactions (tenant_id, domain, user_id, occurred_at desc);
