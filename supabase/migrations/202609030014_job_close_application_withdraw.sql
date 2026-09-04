-- US-56: candidates can withdraw an application. Nullable timestamp,
-- matching the existing approved_at/unsubscribed_at pattern -- null = active.
alter table public.applications
  add column withdrawn_at timestamptz;

-- No UPDATE policy existed on applications at all before this -- candidates
-- could insert and select their own rows, but not modify them.
create policy "Candidates withdraw their own applications"
on public.applications for update to authenticated
using (candidate_id = auth.uid())
with check (candidate_id = auth.uid());

-- US-55: closing a job reuses the existing "Employers manage their own
-- jobs" policy for the UPDATE itself (already covers it). But the public
-- SELECT policy only allowed status = 'published', which would make a
-- closed job's permalink 404 for everyone but its owner -- breaking "URL
-- stays reachable" from this story's AC. Browse/search pages are
-- unaffected: they already filter to status = 'published' explicitly in
-- the application query, on top of whatever RLS additionally permits.
drop policy if exists "Published jobs are public" on public.jobs;
create policy "Published and closed jobs are public"
on public.jobs for select
using (status in ('published', 'closed') and (expires_at is null or expires_at > now()));
