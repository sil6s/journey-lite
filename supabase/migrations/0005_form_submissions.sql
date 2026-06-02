create table if not exists public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  form_key text not null,
  form_name text,
  page_slug text,
  status text not null default 'new',
  submitted_at timestamptz not null default now(),
  data jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  admin_notes text,
  updated_at timestamptz not null default now(),
  constraint form_submissions_status_check check (status in ('new', 'reviewed', 'contacted', 'closed', 'spam'))
);

create index if not exists form_submissions_form_key_idx on public.form_submissions (form_key);
create index if not exists form_submissions_status_idx on public.form_submissions (status);
create index if not exists form_submissions_submitted_at_idx on public.form_submissions (submitted_at desc);
create index if not exists form_submissions_data_gin_idx on public.form_submissions using gin (data);

alter table public.form_submissions enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'set_form_submissions_updated_at'
  ) then
    create or replace function public.set_current_timestamp_updated_at()
    returns trigger
    language plpgsql
    as $function$
    begin
      new.updated_at = now();
      return new;
    end;
    $function$;

    create trigger set_form_submissions_updated_at
      before update on public.form_submissions
      for each row
      execute function public.set_current_timestamp_updated_at();
  end if;
end $$;
