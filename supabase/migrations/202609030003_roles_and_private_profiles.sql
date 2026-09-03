create table if not exists public.candidate_profile_private (
  profile_id uuid primary key references public.candidate_profiles(id) on delete cascade,
  candidate_id uuid not null references public.accounts(id) on delete cascade,
  work_history text,
  desired_pay text,
  created_at timestamptz not null default now()
);

insert into public.candidate_profile_private (profile_id, candidate_id, work_history, desired_pay)
select id, candidate_id, work_history, desired_pay
from public.candidate_profiles
on conflict (profile_id) do nothing;

alter table public.candidate_profile_private enable row level security;

create policy "Candidates manage private profile data"
on public.candidate_profile_private for all to authenticated
using (candidate_id = auth.uid())
with check (candidate_id = auth.uid());

create policy "Employers view paid private profile data"
on public.candidate_profile_private for select to authenticated
using (exists (
  select 1 from public.paid_profile_views
  where paid_profile_views.candidate_id = candidate_profile_private.candidate_id
    and paid_profile_views.employer_id = auth.uid()
));

drop policy if exists "Employers manage their own jobs" on public.jobs;
create policy "Employers manage their own jobs"
on public.jobs for all to authenticated
using (exists (
  select 1 from public.accounts
  where accounts.id = jobs.employer_id and accounts.role = 'employer' and accounts.id = auth.uid()
))
with check (exists (
  select 1 from public.accounts
  where accounts.id = jobs.employer_id and accounts.role = 'employer' and accounts.id = auth.uid()
));

drop policy if exists "Candidates manage their own profiles" on public.candidate_profiles;
create policy "Candidates manage their own profiles"
on public.candidate_profiles for all to authenticated
using (exists (
  select 1 from public.accounts
  where accounts.id = candidate_profiles.candidate_id and accounts.role = 'candidate' and accounts.id = auth.uid()
))
with check (exists (
  select 1 from public.accounts
  where accounts.id = candidate_profiles.candidate_id and accounts.role = 'candidate' and accounts.id = auth.uid()
));

drop policy if exists "Candidates create their own applications" on public.applications;
create policy "Candidates create their own applications"
 on public.applications for insert to authenticated
with check (exists (
  select 1 from public.accounts
  where accounts.id = applications.candidate_id and accounts.role = 'candidate' and accounts.id = auth.uid()
));

drop policy if exists "Candidates view their own applications" on public.applications;
create policy "Candidates view their own applications"
on public.applications for select to authenticated
using (candidate_id = auth.uid());

alter table public.candidate_profiles drop column if exists work_history;
alter table public.candidate_profiles drop column if exists desired_pay;
