-- Run only against a disposable/local Supabase database, after the migration.
-- All fixtures and changes roll back. Needs database-owner permissions.
begin;
set local role supabase_auth_admin;
insert into auth.users (id, raw_user_meta_data) values
('10000000-0000-4000-8000-000000000001', '{"display_name":"Learner One"}'),
('10000000-0000-4000-8000-000000000002', '{"display_name":"Learner Two"}');
reset role;
do $$ begin
  if (select count(*) from public.profiles where id in
    ('10000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002')) <> 2
    then raise exception 'Signup trigger did not create profiles'; end if;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
do $$ begin
  if (select count(*) from public.profiles) <> 1 then raise exception 'RLS leaked another profile'; end if;
  update public.profiles set display_name = 'Changed' where id = '10000000-0000-4000-8000-000000000001';
  if not found then raise exception 'Own display name update was denied'; end if;
  update public.profiles set display_name = 'Forbidden' where id = '10000000-0000-4000-8000-000000000002';
  if found then raise exception 'Cross-user update succeeded'; end if;
  begin
    update public.profiles set created_at = now();
    raise exception 'Timestamp modification was allowed';
  exception when insufficient_privilege then null; end;
  begin
    update public.profiles set id = '10000000-0000-4000-8000-000000000003';
    raise exception 'Identity modification was allowed';
  exception when insufficient_privilege then null; end;
  begin
    delete from public.profiles;
    raise exception 'Deletion was allowed';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.profiles (id) values ('10000000-0000-4000-8000-000000000003');
    raise exception 'Client insertion was allowed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role anon;
do $$ begin
  begin
    perform * from public.profiles;
    raise exception 'Anonymous read was allowed';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
do $$ begin
  if (select display_name from public.profiles where id = '10000000-0000-4000-8000-000000000002') <> 'Learner Two'
    then raise exception 'Other profile was modified'; end if;
end $$;
rollback;
