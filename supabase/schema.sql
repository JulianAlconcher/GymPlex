-- GymPlex - Supabase base schema
-- Run this script in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null unique,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_states (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  selected_week integer not null default 1 check (selected_week > 0),
  rms jsonb not null default '{}'::jsonb,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.routine_weeks (
  week_number integer primary key check (week_number > 0),
  days jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.user_states enable row level security;
alter table public.routine_weeks enable row level security;

drop policy if exists "profiles_select_public" on public.profiles;
create policy "profiles_select_public"
on public.profiles
for select
to anon, authenticated
using (true);

drop policy if exists "profiles_insert_public" on public.profiles;
create policy "profiles_insert_public"
on public.profiles
for insert
to anon, authenticated
with check (true);

drop policy if exists "profiles_update_public" on public.profiles;
create policy "profiles_update_public"
on public.profiles
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "user_states_select_public" on public.user_states;
create policy "user_states_select_public"
on public.user_states
for select
to anon, authenticated
using (true);

drop policy if exists "user_states_insert_public" on public.user_states;
create policy "user_states_insert_public"
on public.user_states
for insert
to anon, authenticated
with check (true);

drop policy if exists "user_states_update_public" on public.user_states;
create policy "user_states_update_public"
on public.user_states
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "routine_weeks_select_public" on public.routine_weeks;
create policy "routine_weeks_select_public"
on public.routine_weeks
for select
to anon, authenticated
using (true);

drop policy if exists "routine_weeks_insert_public" on public.routine_weeks;
create policy "routine_weeks_insert_public"
on public.routine_weeks
for insert
to anon, authenticated
with check (true);

drop policy if exists "routine_weeks_update_public" on public.routine_weeks;
create policy "routine_weeks_update_public"
on public.routine_weeks
for update
to anon, authenticated
using (true)
with check (true);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_user_states_updated_at on public.user_states;
create trigger set_user_states_updated_at
before update on public.user_states
for each row
execute procedure public.set_updated_at();

drop trigger if exists set_routine_weeks_updated_at on public.routine_weeks;
create trigger set_routine_weeks_updated_at
before update on public.routine_weeks
for each row
execute procedure public.set_updated_at();

insert into public.profiles (full_name, is_admin)
values
  ('Francisco Ruiz Gomez', true),
  ('Julian Alconcher', false),
  ('Nacho Berdasco', false),
  ('Antonio Carlos', false),
  ('Tomas Boado', false)
on conflict (full_name) do nothing;
