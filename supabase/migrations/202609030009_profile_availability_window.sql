-- US-11: seasonal profiles need their own date-range availability window,
-- distinct from the existing free-text weekly-schedule `availability` field.
alter table public.candidate_profiles
  add column available_from date,
  add column available_until date,
  add constraint candidate_profiles_window_order
    check (available_from is null or available_until is null or available_from <= available_until);
