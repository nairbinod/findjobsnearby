create extension if not exists "pgcrypto";

create type public.account_role as enum ('employer', 'candidate', 'admin');
create type public.job_status as enum ('draft', 'pending_review', 'published', 'expired', 'closed');
create type public.employment_type as enum ('full_time', 'part_time', 'contract', 'seasonal');

create table public.accounts (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.account_role not null,
  display_name text,
  phone text,
  phone_verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.accounts(id) on delete cascade,
  title text not null,
  company_name text not null,
  city text not null,
  state text not null default 'TX',
  pay_range text not null,
  employment_type public.employment_type not null,
  responsibilities text[] not null default '{}',
  description text,
  status public.job_status not null default 'draft',
  ai_assisted boolean not null default false,
  approved_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint jobs_pay_range_present check (length(trim(pay_range)) > 0),
  constraint jobs_responsibilities_limit check (cardinality(responsibilities) between 3 and 5)
);

create table public.candidate_profiles (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.accounts(id) on delete cascade,
  role_title text not null,
  category text,
  availability text,
  desired_pay text,
  work_history text,
  curated_content text,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  candidate_id uuid not null references public.accounts(id) on delete cascade,
  profile_id uuid not null references public.candidate_profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (job_id, candidate_id)
);

create table public.paid_profile_views (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.accounts(id) on delete cascade,
  candidate_id uuid not null references public.accounts(id) on delete cascade,
  application_id uuid references public.applications(id) on delete set null,
  stripe_payment_id text,
  created_at timestamptz not null default now(),
  unique (employer_id, candidate_id)
);

alter table public.accounts enable row level security;
alter table public.jobs enable row level security;
alter table public.candidate_profiles enable row level security;
alter table public.applications enable row level security;
alter table public.paid_profile_views enable row level security;

create policy "Published jobs are public"
on public.jobs for select
using (status = 'published' and (expires_at is null or expires_at > now()));

create policy "Employers manage their own jobs"
on public.jobs for all to authenticated
using (employer_id = auth.uid())
with check (employer_id = auth.uid());

create policy "Users view their own account"
on public.accounts for select to authenticated
using (id = auth.uid());

create policy "Users create their own account"
on public.accounts for insert to authenticated
with check (id = auth.uid());

create policy "Candidates manage their own profiles"
on public.candidate_profiles for all to authenticated
using (candidate_id = auth.uid())
with check (candidate_id = auth.uid());

create policy "Candidates view their own applications"
on public.applications for select to authenticated
using (candidate_id = auth.uid());

create policy "Candidates create their own applications"
on public.applications for insert to authenticated
with check (candidate_id = auth.uid());

create policy "Employers view applications to their jobs"
on public.applications for select to authenticated
using (exists (
  select 1 from public.jobs
  where jobs.id = applications.job_id and jobs.employer_id = auth.uid()
));

create policy "Employers view paid candidate profiles"
on public.candidate_profiles for select to authenticated
using (exists (
  select 1 from public.paid_profile_views
  where paid_profile_views.candidate_id = candidate_profiles.candidate_id
    and paid_profile_views.employer_id = auth.uid()
));

create policy "Employers view their paid profile views"
on public.paid_profile_views for select to authenticated
using (employer_id = auth.uid());

create index jobs_search_idx on public.jobs (city, state, status, employment_type);
create index applications_job_idx on public.applications (job_id, created_at desc);
create index profiles_candidate_idx on public.candidate_profiles (candidate_id);
