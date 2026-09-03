drop policy if exists "Employers view approved candidate previews" on public.candidate_profiles;
drop policy if exists "Employers view paid candidate profiles" on public.candidate_profiles;

create policy "Employers view profiles submitted to their jobs"
on public.candidate_profiles for select to authenticated
using (exists (
  select 1
  from public.applications
  join public.jobs on jobs.id = applications.job_id
  where applications.profile_id = candidate_profiles.id
    and jobs.employer_id = auth.uid()
));

drop policy if exists "Employers view paid private profile data" on public.candidate_profile_private;
create policy "Employers view private data submitted to their jobs"
on public.candidate_profile_private for select to authenticated
using (exists (
  select 1
  from public.applications
  join public.jobs on jobs.id = applications.job_id
  where applications.profile_id = candidate_profile_private.profile_id
    and jobs.employer_id = auth.uid()
));
