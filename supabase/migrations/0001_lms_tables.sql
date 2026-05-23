-- LMS tables for JourneyLite Patient Education Portal
-- Run this in Supabase SQL Editor or via: supabase db push

-- ================================================================
-- PROFILES
-- ================================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  email       text,
  role        text not null default 'student'
                check (role in ('student', 'admin', 'provider')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ================================================================
-- ENROLLMENTS
-- ================================================================
create table if not exists public.enrollments (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  course_slug  text not null,
  status       text not null default 'active'
                 check (status in ('active', 'completed', 'expired', 'revoked')),
  enrolled_at  timestamptz not null default now(),
  completed_at timestamptz,
  unique(user_id, course_slug)
);

alter table public.enrollments enable row level security;

create policy "Users can view own enrollments"
  on public.enrollments for select
  using (auth.uid() = user_id);

-- ================================================================
-- LESSON PROGRESS
-- ================================================================
create table if not exists public.lesson_progress (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  course_slug     text not null,
  module_slug     text,
  lesson_slug     text not null,
  completed       boolean not null default false,
  completed_at    timestamptz,
  last_viewed_at  timestamptz not null default now(),
  percent_watched numeric not null default 0,
  unique(user_id, course_slug, lesson_slug)
);

alter table public.lesson_progress enable row level security;

create policy "Users can view own lesson progress"
  on public.lesson_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own lesson progress"
  on public.lesson_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own lesson progress"
  on public.lesson_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ================================================================
-- COURSE ACCESS
-- ================================================================
create table if not exists public.course_access (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  course_slug  text not null,
  access_type  text not null default 'manual'
                 check (access_type in ('manual', 'free', 'paid', 'provider-assigned')),
  expires_at   timestamptz,
  created_at   timestamptz not null default now(),
  unique(user_id, course_slug)
);

alter table public.course_access enable row level security;

create policy "Users can view own course access"
  on public.course_access for select
  using (auth.uid() = user_id);

-- ================================================================
-- TRIGGERS
-- ================================================================

-- updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-enroll in free courses: call this function server-side after creating a free course access record
-- (Admin only via service role — not exposed to public client)
