-- US-51: candidates need to read paid_profile_views rows about themselves
-- to know whether an employer has paid to view their profile. The only
-- existing SELECT policy scoped to employer_id, so a candidate's own query
-- was always silently RLS-blocked -- this bug predates any real payment
-- data existing (no Stripe integration yet), so it never surfaced.
create policy "Candidates view their own paid profile views"
on public.paid_profile_views for select to authenticated
using (candidate_id = auth.uid());
