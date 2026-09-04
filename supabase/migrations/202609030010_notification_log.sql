-- §4.9 notifications: server-side only (service-role client bypasses RLS by
-- design here — no client should ever read or write this table directly).
create table public.notification_log (
  id uuid primary key default gen_random_uuid(),
  notification_type text not null check (notification_type in ('new_application', 'profile_viewed', 'season_return')),
  recipient_account_id uuid not null references public.accounts(id) on delete cascade,
  reference_id uuid,
  sent_at timestamptz not null default now(),
  unique (notification_type, recipient_account_id, reference_id)
);

alter table public.notification_log enable row level security;

create index notification_log_recipient_idx on public.notification_log (recipient_account_id, notification_type);
