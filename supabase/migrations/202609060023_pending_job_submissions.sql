-- US-70: an employer with no account yet can draft and submit a job with
-- just an email. The job can't be created as a real public.jobs row until
-- an account exists (jobs.employer_id is not-null, FK'd to accounts), so
-- the full submission is staged here until the employer confirms by email
-- -- at which point the account, session, and jobs row are all created
-- together (see app/post/confirm/route.ts).
create table public.pending_job_submissions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  payload jsonb not null,
  confirmation_token uuid not null default gen_random_uuid() unique,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

alter table public.pending_job_submissions enable row level security;
-- No public policies -- reads and writes only go through server routes
-- using the service-role client, matching job_alert_subscribers' pattern.

-- US-70's own AC: cap unconfirmed submissions per email, since this is the
-- one path in the product reachable with no account and no session.
create index pending_job_submissions_email_idx on public.pending_job_submissions (email, created_at) where confirmed_at is null;
