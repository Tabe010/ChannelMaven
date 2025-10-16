-- PostgreSQL schema for AI Interview System
create extension if not exists pgcrypto;

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  partner_name text not null,
  partner_email text,
  topic text not null,
  status text not null default 'active', -- draft | active | complete
  progress double precision not null default 0,
  threshold double precision not null default 0.85,
  magic_token text unique not null,
  language text not null default 'es', -- es | en
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists slots (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  slot_key text not null,
  weight double precision not null default 0.1,
  coverage double precision not null default 0,
  confidence double precision not null default 0,
  is_blocker boolean not null default false,
  notes text
);
create index if not exists slots_session_idx on slots(session_id);

create table if not exists qa_log (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  turn int not null,
  question text not null,
  answer text,
  target_slot text,
  created_at timestamptz not null default now()
);
create index if not exists qa_log_session_idx on qa_log(session_id);

create table if not exists materials (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  url text,
  file_path text,
  type text not null default 'url'
);

create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  type text not null, -- brief|blog|stills|scripts|hooks
  file_path text,
  url text,
  created_at timestamptz not null default now()
);

-- Seed minimal default slots template (spanish)
-- Adjust weights as needed
insert into slots (session_id, slot_key, weight, is_blocker)
select null, s.slot_key, s.weight, s.is_blocker
from (values
  ('meta', 0.10, false),
  ('audience', 0.15, false),
  ('offer', 0.15, false),
  ('proof', 0.10, false),
  ('seo', 0.15, false),
  ('message', 0.10, false),
  ('distribution', 0.10, false),
  ('legals', 0.05, true),
  ('creative', 0.10, false)
) as s(slot_key, weight, is_blocker)
where false; -- document-only example (do not run as-is)
