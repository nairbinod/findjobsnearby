-- Simplification: replace the fixed "unclaimed placeholder" system account
-- with a plain nullable employer_id. A seeded-but-unclaimed listing now has
-- employer_id = null instead of pointing at a fake account row, which is
-- more honest ("no employer yet" vs. "owned by a fake employer") and drops
-- the need to create/maintain that system account at all.
--
-- Nothing else needs to change: "Employers manage their own jobs" already
-- reads `employer_id = auth.uid()`, and a null employer_id can never equal
-- a real auth.uid(), so it fails safe exactly like the placeholder id did.
-- Verified live before writing this migration that zero jobs (or any other
-- table) currently reference the placeholder account, so no data backfill
-- is needed -- this is a pure constraint change.
alter table public.jobs
  alter column employer_id drop not null;
