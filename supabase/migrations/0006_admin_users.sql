create table if not exists public.admin_users (
  email text primary key,
  role text not null default 'admin',
  status text not null default 'active',
  invited_at timestamptz,
  invited_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_users_email_lower_check check (email = lower(email)),
  constraint admin_users_role_check check (role in ('admin', 'superadmin')),
  constraint admin_users_status_check check (status in ('active', 'disabled'))
);

create index if not exists admin_users_role_idx on public.admin_users (role);
create index if not exists admin_users_status_idx on public.admin_users (status);

alter table public.admin_users enable row level security;

grant select, insert, update on public.admin_users to service_role;

create or replace function public.set_current_timestamp_updated_at()
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
    select 1
    from pg_trigger
    where tgname = 'set_admin_users_updated_at'
  ) then
    create trigger set_admin_users_updated_at
      before update on public.admin_users
      for each row
      execute function public.set_current_timestamp_updated_at();
  end if;
end $$;

insert into public.admin_users (email, role, status)
values ('silas.c.curry@gmail.com', 'superadmin', 'active')
on conflict (email) do update
set role = 'superadmin',
    status = 'active',
    updated_at = now();
