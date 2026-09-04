-- US-52: low-friction, account-free job alert signup. No public RLS
-- policies -- signup and unsubscribe both go through server routes using
-- the service-role client, matching notification_log's pattern.
create table public.job_alert_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  category text,
  unsubscribe_token uuid not null default gen_random_uuid(),
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint job_alert_subscribers_category_allowed
    check (category is null or category in ('Food & hospitality', 'Skilled trades', 'Care & education', 'Operations'))
);

alter table public.job_alert_subscribers enable row level security;

create table public.job_alert_sent_log (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references public.job_alert_subscribers(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  sent_at timestamptz not null default now(),
  unique (subscriber_id, job_id)
);

alter table public.job_alert_sent_log enable row level security;

create index job_alert_subscribers_active_idx on public.job_alert_subscribers (category) where unsubscribed_at is null;
