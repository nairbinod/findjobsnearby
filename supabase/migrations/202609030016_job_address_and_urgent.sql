-- Street address for the listing (optional -- some employers won't want to
-- publish an exact address) and an "urgently hiring" flag employers can
-- toggle on their own listing.
alter table public.jobs
  add column address text,
  add column urgent boolean not null default false;
