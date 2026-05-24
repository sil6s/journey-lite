-- LMS tables for JourneyLite Patient Education Portal

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
-- ENROLLMENTS (user self-enrollment)
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

create policy "Users can self-enroll"
  on public.enrollments for insert
  with check (auth.uid() = user_id and status = 'active');

create policy "Users can reactivate own enrollment"
  on public.enrollments for update
  using (auth.uid() = user_id and status <> 'revoked')
  with check (auth.uid() = user_id and status in ('active', 'completed'));

-- ================================================================
-- COURSE ASSIGNMENTS (admin/provider-assigned courses)
-- ================================================================
create table if not exists public.course_assignments (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  course_slug  text not null,
  assigned_by  uuid references auth.users(id),
  assigned_at  timestamptz not null default now(),
  due_at       timestamptz,
  status       text not null default 'assigned'
                 check (status in ('assigned', 'in_progress', 'completed', 'overdue', 'revoked')),
  unique(user_id, course_slug)
);

alter table public.course_assignments enable row level security;

create policy "Users can view own assignments"
  on public.course_assignments for select
  using (auth.uid() = user_id);

-- ================================================================
-- USER COURSE PROGRESS (per-lesson progress tracking)
-- ================================================================
create table if not exists public.user_course_progress (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  course_slug     text not null,
  section_title   text,
  lesson_slug     text not null,
  status          text not null default 'not_started'
                    check (status in ('not_started', 'in_progress', 'completed')),
  completed_at    timestamptz,
  last_viewed_at  timestamptz not null default now(),
  unique(user_id, course_slug, lesson_slug)
);

alter table public.user_course_progress enable row level security;

create policy "Users can view own course progress"
  on public.user_course_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own course progress"
  on public.user_course_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own course progress"
  on public.user_course_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ================================================================
-- USER LESSON EVENTS (audit / analytics)
-- ================================================================
create table if not exists public.user_lesson_events (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  course_slug  text not null,
  lesson_slug  text not null,
  event        text not null,
  metadata     jsonb not null default '{}',
  created_at   timestamptz not null default now()
);

alter table public.user_lesson_events enable row level security;

create policy "Users can view own lesson events"
  on public.user_lesson_events for select
  using (auth.uid() = user_id);

create policy "Users can insert own lesson events"
  on public.user_lesson_events for insert
  with check (auth.uid() = user_id);

-- ================================================================
-- USER QUIZ ATTEMPTS
-- ================================================================
create table if not exists public.user_quiz_attempts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  course_slug  text not null,
  lesson_slug  text not null,
  score        numeric not null default 0,
  passed       boolean not null default false,
  answers      jsonb not null default '{}',
  started_at   timestamptz not null default now(),
  submitted_at timestamptz
);

alter table public.user_quiz_attempts enable row level security;

create policy "Users can view own quiz attempts"
  on public.user_quiz_attempts for select
  using (auth.uid() = user_id);

create policy "Users can insert own quiz attempts"
  on public.user_quiz_attempts for insert
  with check (auth.uid() = user_id);

-- ================================================================
-- COMPLETION ATTESTATIONS
-- ================================================================
create table if not exists public.completion_attestations (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  course_slug  text not null,
  attested_at  timestamptz not null default now(),
  ip_hash      text,
  user_agent   text,
  metadata     jsonb not null default '{}'
);

alter table public.completion_attestations enable row level security;

create policy "Users can view own attestations"
  on public.completion_attestations for select
  using (auth.uid() = user_id);

create policy "Users can insert own attestations"
  on public.completion_attestations for insert
  with check (auth.uid() = user_id);

-- ================================================================
-- COURSE ACCESS (legacy / admin-granted access records)
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
-- LESSON PROGRESS (simple progress — kept for compatibility)
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
-- TRIGGERS
-- ================================================================

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
