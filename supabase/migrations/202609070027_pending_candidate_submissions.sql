-- US-71: a candidate with no account yet can apply with just an email,
-- mirroring US-70's employer-side flow. candidate_profiles.candidate_id and
-- applications.candidate_id are both not-null (FK'd to accounts), so the
-- application can't become a real row until an account exists -- staged
-- here until confirmed (see app/apply/confirm/route.ts).
--
-- confirmation_token has an explicit default this time -- US-70's
-- equivalent column (jobs.claim_token) shipped without one and was always
-- null on insert until a follow-up migration fixed it.
create table public.pending_candidate_submissions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  job_id uuid not null references public.jobs(id) on delete cascade,
  payload jsonb not null,
  confirmation_token uuid not null default gen_random_uuid() unique,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

alter table public.pending_candidate_submissions enable row level security;
-- No public policies -- reads and writes only go through server routes
-- using the service-role client, matching pending_job_submissions.

create index pending_candidate_submissions_email_idx on public.pending_candidate_submissions (email, created_at) where confirmed_at is null;
