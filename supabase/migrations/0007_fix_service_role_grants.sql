-- ─────────────────────────────────────────────────────────────────────────────
-- 0007_fix_service_role_grants.sql
--
-- Fixes "permission denied for table form_submissions" and ensures both
-- form_submissions and admin_users exist with correct service_role grants.
--
-- Root cause: 0005_form_submissions.sql enabled RLS on the table but never
-- granted service_role access to it. In Supabase, service_role bypasses RLS
-- policies but still needs an explicit table-level GRANT.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Ensure form_submissions exists ─────────────────────────────────────────
create table if not exists public.form_submissions (
  id           uuid        primary key default gen_random_uuid(),
  form_key     text        not null,
  form_name    text,
  page_slug    text,
  status       text        not null default 'new',
  submitted_at timestamptz not null default now(),
  data         jsonb       not null default '{}'::jsonb,
  metadata     jsonb       not null default '{}'::jsonb,
  admin_notes  text,
  updated_at   timestamptz not null default now(),
  constraint form_submissions_status_check
    check (status in ('new', 'reviewed', 'contacted', 'closed', 'spam'))
);

create index if not exists form_submissions_form_key_idx    on public.form_submissions (form_key);
create index if not exists form_submissions_status_idx      on public.form_submissions (status);
create index if not exists form_submissions_submitted_at_idx on public.form_submissions (submitted_at desc);
create index if not exists form_submissions_data_gin_idx    on public.form_submissions using gin (data);

alter table public.form_submissions enable row level security;

-- ── 2. Grant service_role access (THE FIX) ────────────────────────────────────
-- service_role bypasses RLS but still needs explicit table grants.
grant select, insert, update, delete on public.form_submissions to service_role;

-- ── 3. Ensure admin_users exists ──────────────────────────────────────────────
create table if not exists public.admin_users (
  email       text        primary key,
  role        text        not null default 'admin',
  status      text        not null default 'active',
  invited_at  timestamptz,
  invited_by  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint admin_users_email_lower_check check (email = lower(email)),
  constraint admin_users_role_check   check (role   in ('admin', 'superadmin')),
  constraint admin_users_status_check check (status in ('active', 'disabled'))
);

create index if not exists admin_users_role_idx   on public.admin_users (role);
create index if not exists admin_users_status_idx on public.admin_users (status);

alter table public.admin_users enable row level security;

-- Also make sure admin_users grant is present (0006 set it but re-asserting is safe)
grant select, insert, update on public.admin_users to service_role;

-- ── 4. Seed superadmin (idempotent) ───────────────────────────────────────────
insert into public.admin_users (email, role, status)
values ('silas.c.curry@gmail.com', 'superadmin', 'active')
on conflict (email) do update
  set role       = excluded.role,
      status     = excluded.status,
      updated_at = now();

-- ── 5. auto-update updated_at trigger (idempotent) ───────────────────────────
create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_form_submissions_updated_at'
  ) then
    create trigger set_form_submissions_updated_at
      before update on public.form_submissions
      for each row execute function public.set_current_timestamp_updated_at();
  end if;

  if not exists (
    select 1 from pg_trigger where tgname = 'set_admin_users_updated_at'
  ) then
    create trigger set_admin_users_updated_at
      before update on public.admin_users
      for each row execute function public.set_current_timestamp_updated_at();
  end if;
end $$;
