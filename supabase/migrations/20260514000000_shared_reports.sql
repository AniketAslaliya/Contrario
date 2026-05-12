-- Public share links for analyses (M12). Deleted when analysis row is removed.

create table if not exists public.shared_reports (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  user_id text not null,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists shared_reports_slug_idx on public.shared_reports (slug);
create index if not exists shared_reports_analysis_idx on public.shared_reports (analysis_id);

alter table public.shared_reports enable row level security;
