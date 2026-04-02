-- T024: RLS for enrollments and progress

alter table public.enrollments enable row level security;
alter table public.progress enable row level security;

-- Enrollments: read own, insert when authenticated
create policy "Users can read own enrollments"
  on public.enrollments for select
  using (auth.uid() = user_id);

create policy "Authenticated users can enroll"
  on public.enrollments for insert
  with check (auth.uid() = user_id);

-- Progress: read own, upsert own
create policy "Users can read own progress"
  on public.progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on public.progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
