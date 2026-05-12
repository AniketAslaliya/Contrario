-- Optional display name + last uploaded deck (Storage path) for signed-in users.

alter table public.profiles add column if not exists display_name text;

alter table public.profiles add column if not exists last_deck_storage_path text;
alter table public.profiles add column if not exists last_deck_file_name text;
alter table public.profiles add column if not exists last_deck_at timestamptz;
