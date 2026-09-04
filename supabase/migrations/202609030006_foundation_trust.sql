-- US-21a: basic unique job-view counts
create table public.job_views (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  visitor_hash text not null,
  created_at timestamptz not null default now(),
  unique (job_id, visitor_hash)
);

alter table public.job_views enable row level security;

create policy "Anyone can record a job view"
on public.job_views for insert to anon, authenticated
with check (true);

create policy "Employers count views on their own jobs"
on public.job_views for select to authenticated
using (exists (
  select 1 from public.jobs
  where jobs.id = job_views.job_id and jobs.employer_id = auth.uid()
));

-- US-28: report/flag listings and profiles
create table public.flags (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('job', 'profile')),
  target_id uuid not null,
  reporter_id uuid references public.accounts(id) on delete set null,
  reason text not null,
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now()
);

alter table public.flags enable row level security;

create policy "Signed-in users can file a flag"
on public.flags for insert to authenticated
with check (reporter_id = auth.uid());

create policy "Reporters view their own flags"
on public.flags for select to authenticated
using (reporter_id = auth.uid());

-- US-29: employer disputes on paid profile views
create table public.disputes (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.accounts(id) on delete cascade,
  paid_profile_view_id uuid not null references public.paid_profile_views(id) on delete cascade,
  reason text not null,
  status text not null default 'open' check (status in ('open', 'resolved', 'denied')),
  created_at timestamptz not null default now(),
  unique (paid_profile_view_id)
);

alter table public.disputes enable row level security;

create policy "Employers file disputes on their own paid views"
on public.disputes for insert to authenticated
with check (employer_id = auth.uid());

create policy "Employers view their own disputes"
on public.disputes for select to authenticated
using (employer_id = auth.uid());

-- US-34: referrals
alter table public.accounts add column referral_code text unique default encode(gen_random_bytes(4), 'hex');
alter table public.accounts add column verified_at timestamptz;

create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.accounts(id) on delete cascade,
  referred_account_id uuid references public.accounts(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.referrals enable row level security;

create policy "Referrers view their own referrals"
on public.referrals for select to authenticated
using (referrer_id = auth.uid());

create policy "A new account can record who referred it"
on public.referrals for insert to authenticated
with check (referred_account_id = auth.uid());

-- US-11: cap candidate profiles at 5 per account
create or replace function public.enforce_profile_limit()
returns trigger as $$
begin
  if (select count(*) from public.candidate_profiles where candidate_id = new.candidate_id) >= 5 then
    raise exception 'Candidates may have at most 5 profiles.';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger candidate_profiles_limit
before insert on public.candidate_profiles
for each row execute function public.enforce_profile_limit();

-- US-27: block phone numbers / emails from listings and applications
create or replace function public.contains_contact_info(value text)
returns boolean as $$
begin
  if value is null then
    return false;
  end if;
  return value ~ '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'
    or value ~ '(\+?1[-. ]?)?\(?[0-9]{3}\)?[-. ]?[0-9]{3}[-. ]?[0-9]{4}';
end;
$$ language plpgsql immutable;

create or replace function public.block_job_contact_info()
returns trigger as $$
begin
  if public.contains_contact_info(new.title)
    or public.contains_contact_info(new.description)
    or public.contains_contact_info(array_to_string(new.responsibilities, ' ')) then
    raise exception 'Remove phone numbers or email addresses from the listing.';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger jobs_block_contact_info
before insert or update on public.jobs
for each row execute function public.block_job_contact_info();

create or replace function public.block_profile_contact_info()
returns trigger as $$
begin
  if public.contains_contact_info(new.role_title) or public.contains_contact_info(new.curated_content) then
    raise exception 'Remove phone numbers or email addresses from the profile.';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger candidate_profiles_block_contact_info
before insert or update on public.candidate_profiles
for each row execute function public.block_profile_contact_info();

create or replace function public.block_private_profile_contact_info()
returns trigger as $$
begin
  if public.contains_contact_info(new.work_history) then
    raise exception 'Remove phone numbers or email addresses from your work history.';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger candidate_profile_private_block_contact_info
before insert or update on public.candidate_profile_private
for each row execute function public.block_private_profile_contact_info();

-- Admin moderation access (US-30)
create or replace function public.is_admin()
returns boolean as $$
  select exists (select 1 from public.accounts where id = auth.uid() and role = 'admin');
$$ language sql stable;

create policy "Admins view all accounts"
on public.accounts for select to authenticated
using (public.is_admin());

create policy "Admins update accounts"
on public.accounts for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins view all jobs"
on public.jobs for select to authenticated
using (public.is_admin());

create policy "Admins update any job"
on public.jobs for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins view all candidate profiles"
on public.candidate_profiles for select to authenticated
using (public.is_admin());

create policy "Admins view all flags"
on public.flags for select to authenticated
using (public.is_admin());

create policy "Admins update flags"
on public.flags for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins view all disputes"
on public.disputes for select to authenticated
using (public.is_admin());

create policy "Admins update disputes"
on public.disputes for update to authenticated
using (public.is_admin())
with check (public.is_admin());
