-- Enhanced LMS tables for assigned JourneyLite patient education.

create table if not exists public.course_assignments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  assigned_by uuid references auth.users(id) on delete set null,
  assigned_at timestamptz not null default now(),
  due_at      timestamptz,
  status      text not null default 'assigned'
                check (status in ('assigned', 'in_progress', 'completed', 'overdue', 'revoked')),
  unique(user_id, course_slug)
);

create table if not exists public.user_course_progress (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  course_slug    text not null,
  section_title  text,
  lesson_slug    text not null,
  status         text not null default 'in_progress'
                   check (status in ('not_started', 'in_progress', 'completed')),
  completed_at   timestamptz,
  last_viewed_at timestamptz not null default now(),
  unique(user_id, course_slug, lesson_slug)
);

create table if not exists public.user_lesson_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  lesson_slug text not null,
  event       text not null,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create table if not exists public.user_quiz_attempts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  course_slug  text not null,
  lesson_slug  text not null,
  score        numeric not null default 0,
  passed       boolean not null default false,
  answers      jsonb not null default '{}'::jsonb,
  started_at   timestamptz not null default now(),
  submitted_at timestamptz
);

create table if not exists public.completion_attestations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  attested_at timestamptz not null default now(),
  ip_hash     text,
  user_agent  text,
  metadata    jsonb not null default '{}'::jsonb
);

alter table public.course_assignments enable row level security;
alter table public.user_course_progress enable row level security;
alter table public.user_lesson_events enable row level security;
alter table public.user_quiz_attempts enable row level security;
alter table public.completion_attestations enable row level security;

create or replace function public.is_lms_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('admin', 'provider')
  );
$$;

create policy "Patients can view own course assignments"
  on public.course_assignments for select
  using (auth.uid() = user_id or public.is_lms_admin());

create policy "Clinical admins can manage course assignments"
  on public.course_assignments for all
  using (public.is_lms_admin())
  with check (public.is_lms_admin());

create policy "Patients can view own course progress"
  on public.user_course_progress for select
  using (auth.uid() = user_id or public.is_lms_admin());

create policy "Patients can insert own course progress"
  on public.user_course_progress for insert
  with check (auth.uid() = user_id);

create policy "Patients can update own course progress"
  on public.user_course_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Patients can view own lesson events"
  on public.user_lesson_events for select
  using (auth.uid() = user_id or public.is_lms_admin());

create policy "Patients can insert own lesson events"
  on public.user_lesson_events for insert
  with check (auth.uid() = user_id);

create policy "Patients can view own quiz attempts"
  on public.user_quiz_attempts for select
  using (auth.uid() = user_id or public.is_lms_admin());

create policy "Patients can insert own quiz attempts"
  on public.user_quiz_attempts for insert
  with check (auth.uid() = user_id);

create policy "Patients can view own attestations"
  on public.completion_attestations for select
  using (auth.uid() = user_id or public.is_lms_admin());

create policy "Patients can insert own attestations"
  on public.completion_attestations for insert
  with check (auth.uid() = user_id);

create index if not exists course_assignments_user_status_idx
  on public.course_assignments (user_id, status);

create index if not exists user_course_progress_user_course_idx
  on public.user_course_progress (user_id, course_slug);

create index if not exists user_lesson_events_user_course_lesson_idx
  on public.user_lesson_events (user_id, course_slug, lesson_slug);

create index if not exists user_quiz_attempts_user_course_lesson_idx
  on public.user_quiz_attempts (user_id, course_slug, lesson_slug);

grant select, insert, update on public.course_assignments to authenticated;
grant select, insert, update on public.user_course_progress to authenticated;
grant select, insert on public.user_lesson_events to authenticated;
grant select, insert on public.user_quiz_attempts to authenticated;
grant select, insert on public.completion_attestations to authenticated;

-- RLS still denies assignment rows for anonymous users, but this avoids
-- schema-level permission errors during unauthenticated access checks.
grant select on public.course_assignments to anon;

notify pgrst, 'reload schema';
