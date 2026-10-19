-- Apply as the trusted database owner. Never run with frontend credentials.
begin;
do $$ begin
  if to_regclass('public.profiles') is not null then
    raise exception 'public.profiles already exists. Inspect and adapt this migration to reuse it; no changes were made.';
  end if;
end $$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
-- Remove project default privileges, then allow only the intended operations.
revoke all on public.profiles from public, anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;
create policy profiles_select_own on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create function public.zcode_profile_timestamp() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = clock_timestamp();
  return new;
end;
$$;
revoke all on function public.zcode_profile_timestamp() from public, anon, authenticated;
create trigger zcode_profile_timestamp before update on public.profiles
  for each row execute function public.zcode_profile_timestamp();

-- Metadata supplies display text only, never authorization or a role.
create function public.zcode_create_profile() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 200));
  return new;
end;
$$;
revoke all on function public.zcode_create_profile() from public, anon, authenticated;
create trigger zcode_create_profile after insert on auth.users
  for each row execute function public.zcode_create_profile();

-- Backfill accounts created before this migration without touching auth.users.
insert into public.profiles (id, display_name, created_at)
select id, left(coalesce(raw_user_meta_data ->> 'display_name', ''), 200), coalesce(created_at, now())
from auth.users;
commit;
