-- Lets a new signup resolve a referral code to the referrer's account id
-- without opening a broad SELECT policy on public.accounts.
create or replace function public.referrer_id_for_code(code text)
returns uuid as $$
  select id from public.accounts where referral_code = code;
$$ language sql stable security definer set search_path = public;

grant execute on function public.referrer_id_for_code(text) to authenticated;
