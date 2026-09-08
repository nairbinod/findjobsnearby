-- Both subscriber tables were built with zero RLS policies at all (signup
-- and unsubscribe go through service-role routes only), so admin has never
-- been able to see who's subscribed without a database connection. Adds
-- the same admin-select pattern already used for jobs/accounts/applications.
create policy "Admins view all job alert subscribers"
on public.job_alert_subscribers for select to authenticated
using (public.is_admin());

create policy "Admins view all newsletter subscribers"
on public.newsletter_subscribers for select to authenticated
using (public.is_admin());
