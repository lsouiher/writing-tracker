-- T063: RLS for quizzes, quiz_results, labs, lab_submissions, certificates

alter table public.quizzes enable row level security;
alter table public.quiz_results enable row level security;
alter table public.labs enable row level security;
alter table public.lab_submissions enable row level security;
alter table public.certificates enable row level security;

-- Quizzes: authenticated read, admin write
create policy "Authenticated users can read quizzes"
  on public.quizzes for select
  using (auth.uid() is not null);

create policy "Admins can manage quizzes"
  on public.quizzes for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Quiz results: Pro users own rows
create policy "Users can read own quiz results"
  on public.quiz_results for select
  using (auth.uid() = user_id);

create policy "Pro users can insert quiz results"
  on public.quiz_results for insert
  with check (
    auth.uid() = user_id
    and subscription_status(auth.uid()) = 'pro'
  );

-- Labs: authenticated read, admin write
create policy "Authenticated users can read labs"
  on public.labs for select
  using (auth.uid() is not null);

create policy "Admins can manage labs"
  on public.labs for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

-- Lab submissions: Pro users own rows
create policy "Users can read own lab submissions"
  on public.lab_submissions for select
  using (auth.uid() = user_id);

create policy "Pro users can insert lab submissions"
  on public.lab_submissions for insert
  with check (
    auth.uid() = user_id
    and subscription_status(auth.uid()) = 'pro'
  );

-- Certificates: own rows read + public verify by verification_code
create policy "Users can read own certificates"
  on public.certificates for select
  using (auth.uid() = user_id);

-- Public certificate verification is handled via API route using service role
-- No open SELECT policy needed — the verify endpoint uses the service client
