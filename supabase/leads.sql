create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status text not null default 'new',
  name text not null,
  phone text not null,
  email text not null,
  object_type text not null,
  area text not null,
  city text not null,
  budget text not null,
  service text not null,
  start_date text not null,
  comment text,
  manager_note text default '',
  source text,
  utm jsonb,
  activity_trail jsonb,
  next_action text default 'Связаться с клиентом',
  next_action_at text,
  potential_value text,
  lost_reason text
);

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_status_idx on public.leads (status);

alter table public.leads enable row level security;
