-- US-64-69: founder-seeded listings that publish as "Unclaimed" until the
-- real business claims them. jobs.employer_id is not-null (FK'd to
-- accounts), so a seeded job is attached to a fixed system placeholder
-- account (id '1307c3bc-f825-49f9-8ee4-2274905a79bf', created via the
-- admin API, not this migration -- auth.users isn't something migrations
-- should write to directly) until claimed, at which point employer_id is
-- updated to the real employer's account like a normal ownership transfer.
--
-- claim_token is only ever set for seeded/unclaimed listings -- a normal
-- self-posted job never has one, which is also how "is this unclaimed"
-- gets derived (claim_token is not null and claimed_at is null), rather
-- than overloading job_status with a new value that every existing
-- status = 'published' check would need to account for.
alter table public.jobs
  add column claimed_at timestamptz,
  add column claim_token uuid unique,
  add column seed_contact_email text;
