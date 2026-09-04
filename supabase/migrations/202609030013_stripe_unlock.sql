-- US-53: lifetime, account-scoped free-view allowance.
alter table public.accounts
  add column free_views_used integer not null default 0
  check (free_views_used >= 0);

-- Atomic claim -- a single UPDATE is race-safe under concurrent requests
-- (e.g. a double-click) in a way that a read-then-write from the app
-- layer would not be, since Postgres row-locks the matched row for the
-- duration of the statement.
create or replace function public.claim_free_profile_view(p_employer_id uuid)
returns boolean as $$
declare
  affected integer;
begin
  update public.accounts
  set free_views_used = free_views_used + 1
  where id = p_employer_id and free_views_used < 2;
  get diagnostics affected = row_count;
  return affected > 0;
end;
$$ language plpgsql security definer set search_path = public;

grant execute on function public.claim_free_profile_view(uuid) to authenticated, service_role;

-- US-16 fix: candidate_profile_private (work history, desired pay) must be
-- gated by an actual unlock (paid_profile_views), not just "did this
-- candidate apply to my job." The prior policy (from migration 004,
-- unintentionally loosened further in 008) let any employer whose job
-- received an application read that private data for free -- the $2.99
-- paywall was cosmetic; a direct query bypassed it entirely.
drop policy if exists "Employers view private data submitted to their jobs" on public.candidate_profile_private;
drop policy if exists "Employers view private data for approved profiles submitted to their jobs" on public.candidate_profile_private;

create policy "Employers view private data for candidates they have unlocked"
on public.candidate_profile_private for select to authenticated
using (
  exists (
    select 1 from public.paid_profile_views
    where paid_profile_views.candidate_id = candidate_profile_private.candidate_id
      and paid_profile_views.employer_id = auth.uid()
  )
);
