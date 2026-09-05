-- "Employers manage their own jobs" required BOTH employer_id = auth.uid()
-- AND accounts.role = 'employer'. Since this app lets one account toggle
-- between employer/candidate modes (the role column is a mutable session
-- preference, not a fixed account type), that second condition meant
-- switching to browse as a candidate silently locked the owner out of
-- managing jobs they created -- until switching back to employer mode.
-- employer_id is set once at job creation and never changes, so ownership
-- alone is the correct and sufficient check -- matching how every other
-- "manage your own resource" policy in this schema works (applications,
-- candidate_profiles) without a current-role condition.
drop policy if exists "Employers manage their own jobs" on public.jobs;
create policy "Employers manage their own jobs"
on public.jobs for all to authenticated
using (employer_id = auth.uid())
with check (employer_id = auth.uid());
