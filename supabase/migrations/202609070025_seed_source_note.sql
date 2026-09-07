-- Internal-only audit trail for where a seeded listing (US-64) came from --
-- never shown on any public page.
alter table public.jobs
  add column seed_source_note text;
