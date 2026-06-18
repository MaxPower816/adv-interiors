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

create table if not exists public.activity_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  path text not null,
  referrer text,
  payload jsonb
);

create index if not exists activity_events_created_at_idx on public.activity_events (created_at desc);
create index if not exists activity_events_name_idx on public.activity_events (name);

alter table public.activity_events enable row level security;

create table if not exists public.cms_projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published boolean not null default true,
  sort_order integer not null default 0,
  slug text not null unique,
  title text not null,
  city text not null default '',
  area text not null default '',
  year text not null default '',
  type text not null default '',
  description text not null default '',
  works jsonb not null default '[]'::jsonb,
  cover text not null default '',
  images jsonb not null default '[]'::jsonb,
  layout text not null default '',
  characteristics jsonb not null default '{}'::jsonb,
  seo_title text,
  seo_description text
);

create index if not exists cms_projects_published_sort_idx on public.cms_projects (published, sort_order);
create index if not exists cms_projects_slug_idx on public.cms_projects (slug);

alter table public.cms_projects enable row level security;

create table if not exists public.cms_content_blocks (
  id text primary key,
  updated_at timestamptz not null default now(),
  payload jsonb not null default '{}'::jsonb
);

alter table public.cms_content_blocks enable row level security;

create table if not exists public.cms_media (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text not null default '',
  url text not null,
  alt text not null default '',
  kind text not null default 'image',
  width integer,
  height integer,
  size_bytes integer
);

create index if not exists cms_media_created_at_idx on public.cms_media (created_at desc);

alter table public.cms_media enable row level security;
