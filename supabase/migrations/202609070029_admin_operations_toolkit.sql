-- §4.21 Founder/admin operations toolkit (US-72-77). is_admin() already
-- gates admin access on accounts/jobs/flags/disputes (US-30) -- applications
-- and paid_profile_views never got the same treatment because nothing admin
-- needed them before now:
-- - US-75 (disable an application) needs admin select+update on applications,
--   same shape as "Candidates withdraw their own applications" but for any row.
-- - US-76 (revoke a paid unlock) needs admin select+delete on
--   paid_profile_views -- deleting the row IS the revoke, since its mere
--   existence is what the unlock check queries for (see
--   app/api/candidates/[id]/unlocked-profile/route.ts).
create policy "Admins view all applications"
on public.applications for select to authenticated
using (public.is_admin());

create policy "Admins update any application"
on public.applications for update to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admins view all paid profile views"
on public.paid_profile_views for select to authenticated
using (public.is_admin());

create policy "Admins delete any paid profile view"
on public.paid_profile_views for delete to authenticated
using (public.is_admin());
