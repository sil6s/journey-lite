-- ─────────────────────────────────────────────────────────────────────────────
-- 0009_locale_overrides.sql
--
-- AI-translated static UI strings (locales/*.json), keyed by dot-path.
--
-- The locales/ JSON files are baked into the deployed bundle and read-only at
-- runtime on Vercel — writeFileSync() from a serverless function never
-- persists. This table is the actual write target for the admin "Auto
-- translate" action; lib/i18n/server.ts merges these on top of the static
-- English-sourced JSON at request time.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.locale_overrides (
  locale      text        not null,
  namespace   text        not null,
  key         text        not null,
  value       text        not null,
  updated_at  timestamptz not null default now(),
  primary key (locale, namespace, key)
);

create index if not exists locale_overrides_locale_ns_idx on public.locale_overrides (locale, namespace);

alter table public.locale_overrides enable row level security;

grant select, insert, update, delete on public.locale_overrides to service_role;

create or replace function public.set_locale_overrides_updated_at()
returns trigger
language plpgsql
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_locale_overrides_updated_at'
  ) then
    create trigger set_locale_overrides_updated_at
      before update on public.locale_overrides
      for each row
      execute function public.set_locale_overrides_updated_at();
  end if;
end $$;
