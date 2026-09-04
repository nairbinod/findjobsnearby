-- US-18: in-app messaging, gated behind the same permanent per-employer
-- per-candidate unlock as full-profile access (US-16) -- not per job/
-- application, matching that unlock's own "permanent... even if it
-- resurfaces through another of my own job posts" scope.
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.accounts(id) on delete cascade,
  candidate_id uuid not null references public.accounts(id) on delete cascade,
  sender_id uuid not null references public.accounts(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

create index messages_thread_idx on public.messages (employer_id, candidate_id, created_at);

alter table public.messages enable row level security;

create policy "Thread participants read their messages"
on public.messages for select to authenticated
using (employer_id = auth.uid() or candidate_id = auth.uid());

-- The unlock check is enforced here, not just in the UI -- messaging is the
-- paid-for capability itself (US-16's "opens... messaging"), so this is the
-- same kind of DB-level gate as candidate_profile_private's paid-view check.
create policy "Only unlocked pairs can message"
on public.messages for insert to authenticated
with check (
  sender_id = auth.uid()
  and (employer_id = auth.uid() or candidate_id = auth.uid())
  and exists (
    select 1 from public.paid_profile_views v
    where v.employer_id = messages.employer_id and v.candidate_id = messages.candidate_id
  )
);
