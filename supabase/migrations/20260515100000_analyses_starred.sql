-- M16 shortlist flag / star
alter table public.analyses add column if not exists starred boolean not null default false;
