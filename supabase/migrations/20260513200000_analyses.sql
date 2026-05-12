-- Saved analyses (M10) — server-side only via service role (same pattern as profiles).

create table if not exists public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text not null default 'Untitled pitch',
  source text not null check (source in ('paste', 'pdf')),
  input_preview text,
  persona_outputs jsonb not null default '{}'::jsonb,
  synthesis jsonb,
  slide_outline jsonb,
  avg_score real,
  created_at timestamptz not null default now()
);

create index if not exists analyses_user_created_idx
  on public.analyses (user_id, created_at desc);

alter table public.analyses enable row level security;
