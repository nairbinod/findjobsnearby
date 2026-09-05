-- US-59/60/61: employer-authored requirements checklist, candidate
-- self-check-off at apply time, employer-visible match breakdown.
-- Mirrors the existing responsibilities text[] pattern on jobs.
alter table public.jobs
  add column requirements text[];

-- requirement_matches is self-reported and never verified (US-61's own AC);
-- requirements_attested_at is nullable because attestation is only required
-- when the job actually has requirements to attest to -- enforced in the
-- application layer (ApplyForm), same as the existing 3-5 responsibilities
-- count check, not as a DB constraint spanning two tables.
alter table public.applications
  add column requirement_matches text[],
  add column requirement_notes text,
  add column requirements_attested_at timestamptz;

-- requirements is public, employer-authored text like title/description/
-- responsibilities -- extend the existing contact-info guard to cover it too.
create or replace function public.block_job_contact_info()
returns trigger as $$
begin
  if public.contains_contact_info(new.title)
    or public.contains_contact_info(new.description)
    or public.contains_contact_info(array_to_string(new.responsibilities, ' '))
    or public.contains_contact_info(array_to_string(new.requirements, ' ')) then
    raise exception 'Remove phone numbers or email addresses from the listing.';
  end if;
  return new;
end;
$$ language plpgsql;

-- requirement_notes is candidate free text shown in the free applicant
-- preview (US-61), same exposure level as curated_content -- needs the
-- same guard, mirroring block_private_profile_contact_info.
create or replace function public.block_application_contact_info()
returns trigger as $$
begin
  if public.contains_contact_info(new.requirement_notes) then
    raise exception 'Remove phone numbers or email addresses from your application notes.';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger applications_block_contact_info
before insert or update on public.applications
for each row execute function public.block_application_contact_info();
