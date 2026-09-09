-- MoodTracker: Supabase-Schema
-- Im Supabase-Dashboard unter "SQL Editor" einfügen und ausführen.

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  ts bigint not null,
  notiz text default '',
  checkin jsonb default '{}'::jsonb,
  checkout jsonb default '{}'::jsonb,
  schlaf numeric,
  aktivitaet numeric,
  sozial numeric,
  created_at timestamptz default now(),
  unique (user_id, date)
);

create table if not exists public.weekly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  week_start date not null,
  ts bigint not null,
  wochenaufgabe jsonb default '{}'::jsonb,
  skills jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  unique (user_id, week_start)
);

create table if not exists public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  schlaf boolean default true,
  aktivitaet boolean default true,
  sozial boolean default true,
  ziel text default ''
);

-- Row Level Security: jede Person sieht und bearbeitet nur die eigenen Zeilen
alter table public.entries enable row level security;
alter table public.weekly_reviews enable row level security;
alter table public.settings enable row level security;

create policy "entries_owner_access" on public.entries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "weekly_reviews_owner_access" on public.weekly_reviews
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "settings_owner_access" on public.settings
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
