# Profiles and future administrator authorization

## Applying profiles

This repository prepares the migration; it has not been applied to the hosted project. No database management connection is configured in this workspace. A publishable frontend key cannot inspect private database catalogs or apply DDL.

1. Run `inspection/profiles.sql` in the trusted Supabase SQL editor. Inspect columns, constraints, grants, RLS policies, and existing signup triggers.
2. If `public.profiles` exists, reuse it. Adapt a migration to that schema and audit all existing permissive policies/grants before proceeding; do not create a second profile table. The supplied migration intentionally aborts without changes when the table exists.
3. If it does not exist, apply `migrations/202610190001_profiles.sql` through your migration workflow or SQL editor as the database owner. Record it in your migration history. Test in staging first: a failing signup trigger can block signup.
4. Verify signup creates a profile and existing users are backfilled. Verify two different authenticated users cannot read/update each other's rows, anonymous access is denied, and authenticated clients cannot insert/delete profiles or change IDs/timestamps. Users may update only `display_name` (up to 200 characters). `updated_at` is database-managed.

The trigger runs as its trusted owner, uses an empty search path and qualified names, and is not callable by public/anon/authenticated clients. No elevated key is needed in the browser. Display name metadata is used only to seed text during creation; the profile becomes the authoritative display-name source. The dashboard queries the signed-in user's profile, with a metadata fallback and retry message if unavailable. No profile editing screen is in scope.

## Exactly one administrator: future implementation

Do not add roles to editable profiles or infer privileges from an email or `user_metadata`. No administrator assignment or elevated access is implemented here.

In a future migration, introduce a private, non-API-exposed singleton table with a fixed primary-key value constrained to `true` and a unique, non-null `user_id` referencing `auth.users`. Bootstrap exactly one row to the designated user's immutable UUID through a trusted database-owner migration after verifying that identity. The singleton constraint enforces **at most one**; provisioning checks must enforce **exactly one**, and deletion of the designated auth user should be restricted until an intentional administrator transfer. Transfer should atomically update that single row through trusted operations, never a public registration or profile endpoint.

Revoke all client-role privileges on the assignment table. Future privileged operations must check the current `auth.uid()` against that database-controlled UUID in narrowly scoped RLS policies/server authorization. Any helper must have a fixed empty search path, qualified references, minimal grants, and no ability for a caller to select a different identity. UI controls are not authorization. If JWT claims are later used, only a trusted Auth hook may issue them; account for stale claims when revoking access. Keep server secrets outside all `VITE_*` variables and frontend bundles.

References: [Supabase user data and triggers](https://supabase.com/docs/guides/auth/managing-user-data), [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Trigger security audit

`zcode_create_profile` must use `SECURITY DEFINER`, owned by the trusted database owner, with `search_path = ''` and client EXECUTE privileges revoked. `SECURITY INVOKER` cannot insert profiles under the Auth service role with these RLS/grants. The SQL fixture now inserts users as `supabase_auth_admin` to catch this regression rather than testing only owner-created users.

If you already applied an earlier invoker version, editing a local migration does **not** repair the hosted function. Inspect its definition and owner in the SQL editor first:

```sql
select p.oid::regprocedure, pg_get_userbyid(p.proowner) as owner,
       p.prosecdef as security_definer, p.proconfig, pg_get_functiondef(p.oid)
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'zcode_create_profile';
```

Only if its body matches this repository's narrowly scoped trigger and its owner is the trusted database owner, repair it through a recorded owner-run migration:

```sql
begin;
alter function public.zcode_create_profile() security definer;
alter function public.zcode_create_profile() set search_path = '';
revoke all on function public.zcode_create_profile() from public, anon, authenticated;
commit;
```

Do not rerun the initial table-creation migration on an existing table or grant clients INSERT to work around a failing signup trigger.
