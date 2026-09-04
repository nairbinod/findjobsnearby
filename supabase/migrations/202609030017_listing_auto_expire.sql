-- US-31: inactive listings auto-expire instead of sitting live forever.
-- The job_status enum already had 'expired' (migration 001) but nothing
-- ever set it -- a cron now flips published jobs past expires_at to it.

-- The public SELECT policy previously required expires_at > now() even for
-- 'closed' jobs, so a manually-closed listing (US-55) would silently 404 for
-- everyone but its owner once 30 days passed -- breaking that story's own
-- "URL stays reachable" guarantee. Fixed here at the same time as adding
-- 'expired', since it's the same root cause: closed/expired listings should
-- always resolve for their permalink; only 'published' needs the expiry
-- check (and a cron keeps that check nearly redundant in practice).
drop policy if exists "Published and closed jobs are public" on public.jobs;
create policy "Published, closed, and expired jobs are public"
on public.jobs for select
using (
  (status = 'published' and (expires_at is null or expires_at > now()))
  or status in ('closed', 'expired')
);
