create policy "Employers view approved candidate previews"
on public.candidate_profiles for select to authenticated
using (approved_at is not null);
