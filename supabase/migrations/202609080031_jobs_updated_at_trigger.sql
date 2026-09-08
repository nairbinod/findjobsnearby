-- jobs.updated_at existed since the initial schema but was only ever bumped
-- by the manual edit form's own explicit update payload -- every other
-- write path (admin actions, claim, close, renew, the pending-submission
-- confirm routes) left it frozen at its original insert value. That made it
-- an unreliable "last modified" signal, most visibly in the sitemap, whose
-- lastModified now reads this column (see app/sitemap.ts) to tell Google
-- when to re-crawl a listing -- it stayed stuck at the original post date
-- no matter how many times the listing actually changed.
--
-- A trigger makes this correct for every write path uniformly instead of
-- relying on each one remembering to set it -- the now-redundant explicit
-- `updated_at: new Date().toISOString()` in EditJobForm.tsx's own update
-- call is removed for the same reason (single source of truth).
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger jobs_set_updated_at
before update on public.jobs
for each row execute function public.set_updated_at();
