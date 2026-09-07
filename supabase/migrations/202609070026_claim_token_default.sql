-- Bug fix: claim_token had no default, so it was always null on insert --
-- caught live testing the seeding tool (claim link came back as ".../null").
-- Matches the same default gen_random_uuid() pattern already used for
-- job_alert_subscribers.unsubscribe_token and newsletter_subscribers.unsubscribe_token.
alter table public.jobs
  alter column claim_token set default gen_random_uuid();
