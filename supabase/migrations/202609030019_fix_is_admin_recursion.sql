-- Fix: is_admin() queried public.accounts as the calling (RLS-subject) role.
-- Since "Admins view all accounts" (and every other admin policy) calls
-- is_admin(), any accounts query touching a row that isn't the caller's own
-- forced Postgres to re-evaluate that same policy inside is_admin()'s own
-- query -- which called is_admin() again, forever. Confirmed live: any
-- non-exact-id query against accounts (e.g. the admin dashboard's unverified-
-- employers list) threw "stack depth limit exceeded".
--
-- security definer makes is_admin()'s internal lookup run as the function
-- owner, bypassing RLS entirely for that one query -- breaking the cycle
-- without changing what the function computes or who may call it. A pinned
-- search_path is required alongside security definer to prevent a caller
-- from hijacking name resolution inside it.
create or replace function public.is_admin()
returns boolean as $$
  select exists (select 1 from public.accounts where id = auth.uid() and role = 'admin');
$$ language sql stable security definer set search_path = public;
