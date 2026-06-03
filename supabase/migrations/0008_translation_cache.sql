-- ─────────────────────────────────────────────────────────────────────────────
-- 0008_translation_cache.sql
--
-- Persistent cache for AI-generated CMS translations.
--
-- Design goals:
-- • Each row = one Sanity document translated into one locale
-- • Invalidated via source_content_hash — only re-translate when content changes
-- • service_role has full access (used by the Next.js API routes)
-- • anon/authenticated roles have NO access (translations are server-rendered)
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.translation_cache (
  -- Identity
  id                    uuid        primary key default gen_random_uuid(),

  -- Source document metadata (used for cache invalidation)
  source_document_id    text        not null,
  source_document_type  text        not null,          -- 'blogPost' | 'post' | 'sitePage' | etc.
  source_revision_id    text,                          -- Sanity _rev field
  source_updated_at     timestamptz,                   -- Sanity _updatedAt
  source_slug           text        not null,
  source_content_hash   text        not null,          -- SHA-256 of serialized source content

  -- Target locale
  locale                text        not null,

  -- Translated fields (nullable — some docs may not have all fields)
  translated_title      text,
  translated_slug       text,                          -- kept = source slug (no translated slugs)
  translated_excerpt    text,
  translated_body       jsonb,                         -- full Portable Text JSON
  translated_seo_title  text,
  translated_seo_description text,
  translated_faqs       jsonb,                         -- [{question, answer}, …]
  translated_ctas       jsonb,                         -- [{label, url}, …]
  translated_image_alts jsonb,                         -- {assetId: altText, …}

  -- Status tracking
  status                text        not null default 'pending',
  error_message         text,
  translation_provider  text        not null default 'anthropic',
  generated_at          timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  -- Constraints
  constraint translation_cache_locale_check
    check (locale in ('en','es','ar','zh','fr','de','vi','hi','ko','ru')),
  constraint translation_cache_status_check
    check (status in ('pending','translating','complete','error','stale')),
  constraint translation_cache_unique
    unique (source_document_id, locale)
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
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

-- ── Row-Level Security ────────────────────────────────────────────────────────
alter table public.translation_cache enable row level security;

-- service_role bypasses RLS — but still needs explicit GRANT
grant select, insert, update, delete on public.translation_cache to service_role;

-- No public read access — translations are served server-side only
-- (If you later add a public read policy, restrict to status = 'complete')

-- ── auto-update updated_at ────────────────────────────────────────────────────
-- Reuse the function created in earlier migrations
do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'set_translation_cache_updated_at'
  ) then
    create trigger set_translation_cache_updated_at
      before update on public.translation_cache
      for each row
      execute function public.set_current_timestamp_updated_at();
  end if;
end $$;

-- ── Helper function: get a cached translation ─────────────────────────────────
create or replace function public.get_translation(
  p_document_id  text,
  p_locale       text
)
returns public.translation_cache
language sql
stable
security definer
as $$
  select * from public.translation_cache
  where source_document_id = p_document_id
    and locale = p_locale
    and status = 'complete'
  limit 1;
$$;

-- ── Helper view: stale translations (hash changed since last generation) ──────
-- Useful for background jobs that need to find and refresh stale content.
-- Note: you pass the current hashes from the application layer, so this view
-- is illustrative; the actual staleness check is done in the TypeScript layer.
comment on table public.translation_cache is
  'Persistent cache for AI-generated CMS translations. One row per (source_document_id, locale) pair.
   Invalidate by comparing source_content_hash to the hash of the current Sanity document.
   status: pending=queued, translating=in-flight, complete=ready, error=failed, stale=outdated.';
