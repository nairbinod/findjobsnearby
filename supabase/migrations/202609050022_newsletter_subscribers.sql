-- US-49: newsletter signup from the blog/guides, separate from job-alert
-- subscribers (US-52) -- different audience, different content, different
-- unsubscribe list. Same shape/pattern as job_alert_subscribers: no public
-- RLS policies, signup and unsubscribe both go through server routes using
-- the service-role client.
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  unsubscribe_token uuid not null default gen_random_uuid(),
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;
