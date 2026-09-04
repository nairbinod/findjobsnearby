alter table public.jobs
  add column category text;

alter table public.jobs
  add constraint jobs_category_allowed
  check (category is null or category in ('Food & hospitality', 'Skilled trades', 'Care & education', 'Operations'));

create index jobs_category_idx on public.jobs (city, category, status);
