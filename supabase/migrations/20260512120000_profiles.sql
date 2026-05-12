-- Profiles for NextAuth-managed users (read/write via service role from Next.js only).

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique,
  email text,
  role text not null check (
    role in ('founder', 'student', 'accelerator', 'angel', 'mentor')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_user_id_idx on public.profiles (user_id);

alter table public.profiles enable row level security;

-- Intentionally no policies: anon/key cannot SELECT/INSERT directly.
-- The app uses SUPABASE_SERVICE_ROLE_KEY on the server only (bypasses RLS).
