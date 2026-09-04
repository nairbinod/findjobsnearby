-- Bug fix: an account's role was set once at creation and could never
-- change. Someone who first signed up as a candidate (e.g. to test
-- ApplyForm) and later tried to post a job with the same email hit
-- "new row violates row-level security policy for table jobs" -- correctly
-- blocked by the jobs policy requiring role = 'employer', but with no way
-- to ever become an employer afterward. No UPDATE policy existed on
-- accounts at all for a regular user -- only admins could update any row.
create policy "Users update their own account"
on public.accounts for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());
