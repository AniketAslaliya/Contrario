-- M24 waitlist
create table if not exists public.waitlist_entries (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  referral_code text unique,
  referred_by text,
  created_at timestamptz not null default now()
);

-- M14 org accounts
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique,
  persona_weights jsonb not null default '{"scale-chaser":0.34,"conviction-buyer":0.33,"reality-check":0.33}'::jsonb,
  created_by text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.org_members (
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id text not null,
  role text not null check (role in ('admin', 'member')),
  primary key (org_id, user_id)
);

alter table public.profiles add column if not exists org_id uuid references public.organizations(id);
alter table public.analyses add column if not exists org_id uuid references public.organizations(id);

-- M21 mentor layer
create table if not exists public.mentor_notes (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  author_user_id text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists mentor_notes_analysis_idx on public.mentor_notes (analysis_id);

-- M22 notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

alter table public.waitlist_entries enable row level security;
alter table public.organizations enable row level security;
alter table public.org_members enable row level security;
alter table public.mentor_notes enable row level security;
alter table public.notifications enable row level security;
