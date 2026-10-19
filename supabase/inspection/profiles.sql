-- Run read-only in the Supabase SQL editor BEFORE applying the migration.
select to_regclass('public.profiles') as existing_profiles;
select column_name, data_type, is_nullable, column_default
from information_schema.columns where table_schema = 'public' and table_name = 'profiles';
select * from pg_policies where schemaname = 'public' and tablename = 'profiles';
select grantee, privilege_type from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'profiles';
select grantee, column_name, privilege_type from information_schema.column_privileges
where table_schema = 'public' and table_name = 'profiles';
select conname, pg_get_constraintdef(oid) from pg_constraint
where conrelid = to_regclass('public.profiles');
select tgname, pg_get_triggerdef(oid) from pg_trigger
where tgrelid in (to_regclass('public.profiles'), to_regclass('auth.users')) and not tgisinternal;
