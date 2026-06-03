-- ═══════════════════════════════════════════════════════════════════════════════
-- JourneyLite — consolidated pending migrations
-- Run this once in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- All statements are fully IDEMPOTENT — safe to re-run.
--
-- Covers:
--   0007  form_submissions GRANT fix + admin_users table
--   0008  translation_cache table (AI CMS translations)
-- ═══════════════════════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────────────────────
-- SHARED: updated_at trigger function (used by multiple tables)
-- ───────────────────────────────────────────────────────────────────────────────

create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ═══════════════════════════════════════════════════════════════════════════════
-- 0007 — form_submissions + admin_users
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── form_submissions ──────────────────────────────────────────────────────────

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

create index if not exists form_submissions_form_key_idx     on public.form_submissions (form_key);
create index if not exists form_submissions_status_idx       on public.form_submissions (status);
create index if not exists form_submissions_submitted_at_idx on public.form_submissions (submitted_at desc);
create index if not exists form_submissions_data_gin_idx     on public.form_submissions using gin (data);

alter table public.form_submissions enable row level security;

-- THE FIX: service_role needs explicit GRANT even though it bypasses RLS
grant select, insert, update, delete on public.form_submissions to service_role;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_form_submissions_updated_at'
  ) then
    create trigger set_form_submissions_updated_at
      before update on public.form_submissions
      for each row execute function public.set_current_timestamp_updated_at();
  end if;
end $$;

-- ── admin_users ───────────────────────────────────────────────────────────────

create table if not exists public.admin_users (
  email       text        primary key,
  role        text        not null default 'admin',
  status      text        not null default 'active',
  invited_at  timestamptz,
  invited_by  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint admin_users_email_lower_check check (email = lower(email)),
  constraint admin_users_role_check        check (role   in ('admin', 'superadmin')),
  constraint admin_users_status_check      check (status in ('active', 'disabled'))
);

create index if not exists admin_users_role_idx   on public.admin_users (role);
create index if not exists admin_users_status_idx on public.admin_users (status);

alter table public.admin_users enable row level security;

grant select, insert, update on public.admin_users to service_role;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_admin_users_updated_at'
  ) then
    create trigger set_admin_users_updated_at
      before update on public.admin_users
      for each row execute function public.set_current_timestamp_updated_at();
  end if;
end $$;

-- Seed superadmin (idempotent)
insert into public.admin_users (email, role, status)
values ('silas.c.curry@gmail.com', 'superadmin', 'active')
on conflict (email) do update
  set role       = excluded.role,
      status     = excluded.status,
      updated_at = now();


-- ═══════════════════════════════════════════════════════════════════════════════
-- 0008 — translation_cache (AI CMS translations via DeepSeek)
-- ═══════════════════════════════════════════════════════════════════════════════

create table if not exists public.translation_cache (
  id                      uuid        primary key default gen_random_uuid(),

  -- Source Sanity document
  source_document_id      text        not null,
  source_document_type    text        not null,   -- 'blogPost' | 'post' | 'sitePage' | etc.
  source_revision_id      text,                   -- Sanity _rev
  source_updated_at       timestamptz,            -- Sanity _updatedAt
  source_slug             text        not null,
  source_content_hash     text        not null,   -- SHA-256(translatable fields) — invalidation key

  -- Target
  locale                  text        not null,

  -- Translated content (all nullable — not every doc type has every field)
  translated_title        text,
  translated_slug         text,                   -- always = source_slug (no translated slugs)
  translated_excerpt      text,
  translated_body         jsonb,                  -- Portable Text JSON
  translated_seo_title    text,
  translated_seo_description text,
  translated_faqs         jsonb,                  -- [{question, answer}, …]
  translated_ctas         jsonb,                  -- [{label, url}, …]
  translated_image_alts   jsonb,                  -- {assetId: altText, …}

  -- Status / audit
  status                  text        not null default 'pending',
  error_message           text,
  translation_provider    text        not null default 'deepseek',  -- fixed: was 'anthropic'
  generated_at            timestamptz,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),

  constraint translation_cache_locale_check
    check (locale in ('en','es','ar','zh','fr','de','vi','hi','ko','ru')),
  constraint translation_cache_status_check
    check (status in ('pending','translating','complete','error','stale')),
  constraint translation_cache_unique
    unique (source_document_id, locale)
);

create index if not exists translation_cache_doc_locale_idx
  on public.translation_cache (source_document_id, locale);

create index if not exists translation_cache_slug_locale_idx
  on public.translation_cache (source_slug, locale);

create index if not exists translation_cache_status_idx
  on public.translation_cache (status);

create index if not exists translation_cache_hash_idx
  on public.translation_cache (source_content_hash);

create index if not exists translation_cache_type_idx
  on public.translation_cache (source_document_type);

-- Index for the distributed-lock timeout query in cache.ts
-- isDistributedTranslationInProgress() filters: status='translating' AND updated_at > now()-5min
create index if not exists translation_cache_translating_idx
  on public.translation_cache (source_document_id, locale, updated_at)
  where status = 'translating';

alter table public.translation_cache enable row level security;

grant select, insert, update, delete on public.translation_cache to service_role;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_translation_cache_updated_at'
  ) then
    create trigger set_translation_cache_updated_at
      before update on public.translation_cache
      for each row execute function public.set_current_timestamp_updated_at();
  end if;
end $$;

comment on table public.translation_cache is
  'AI-generated CMS translation cache. One row per (source_document_id, locale).
   Invalidated by content hash mismatch or Sanity publish webhook → /api/sanity-webhook.
   Statuses: pending→queued, translating→in-flight, complete→ready, error→failed, stale→needs refresh.
   provider: deepseek (DeepSeek-V3 via deepseek-chat model).';


-- ═══════════════════════════════════════════════════════════════════════════════
-- VERIFY — quick check after running (optional, won't fail anything)
-- ═══════════════════════════════════════════════════════════════════════════════

select
  t.table_name,
  count(c.column_name) as column_count
from information_schema.tables t
join information_schema.columns c using (table_name, table_schema)
where t.table_schema = 'public'
  and t.table_name in ('form_submissions', 'admin_users', 'translation_cache')
group by t.table_name
order by t.table_name;
