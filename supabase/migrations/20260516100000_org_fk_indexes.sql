-- Performance: cover org_id FK lookups (Supabase advisor unindexed_foreign_keys)
create index if not exists analyses_org_id_idx on public.analyses (org_id);
create index if not exists profiles_org_id_idx on public.profiles (org_id);
