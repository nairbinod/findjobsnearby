-- US-10: candidates must approve a profile before an employer can see it.
-- The prior policies only checked the application/job link, not approval --
-- an unapproved profile (approved_at is null) was still selectable by the
-- employer of the job it was submitted to.

drop policy if exists "Employers view profiles submitted to their jobs" on public.candidate_profiles;
create policy "Employers view approved profiles submitted to their jobs"
on public.candidate_profiles for select to authenticated
using (
  approved_at is not null
  and exists (
    select 1
    from public.applications
    join public.jobs on jobs.id = applications.job_id
    where applications.profile_id = candidate_profiles.id
      and jobs.employer_id = auth.uid()
  )
);

drop policy if exists "Employers view private data submitted to their jobs" on public.candidate_profile_private;
create policy "Employers view private data for approved profiles submitted to their jobs"
on public.candidate_profile_private for select to authenticated
using (
  exists (
    select 1
    from public.applications
    join public.jobs on jobs.id = applications.job_id
    join public.candidate_profiles on candidate_profiles.id = applications.profile_id
    where applications.profile_id = candidate_profile_private.profile_id
      and jobs.employer_id = auth.uid()
      and candidate_profiles.approved_at is not null
  )
);
