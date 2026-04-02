-- T139: RLS for capstone_submissions and capstone_reviews

alter table public.capstone_submissions enable row level security;
alter table public.capstone_reviews enable row level security;

-- Capstone submissions: own rows + course peers if peer_review_open
create policy "Users can read own capstone submissions"
  on public.capstone_submissions for select
  using (auth.uid() = user_id);

create policy "Users can read open peer review submissions"
  on public.capstone_submissions for select
  using (
    peer_review_open = true
    and subscription_status(auth.uid()) = 'pro'
  );

create policy "Pro users can insert own capstone submissions"
  on public.capstone_submissions for insert
  with check (
    auth.uid() = user_id
    and subscription_status(auth.uid()) = 'pro'
  );

create policy "Server can update capstone submissions"
  on public.capstone_submissions for update
  using (auth.uid() = user_id);

-- Capstone reviews: Pro users on open submissions
create policy "Users can read reviews on own submissions"
  on public.capstone_reviews for select
  using (
    exists (
      select 1 from public.capstone_submissions
      where id = submission_id and user_id = auth.uid()
    )
  );

create policy "Reviewers can read own reviews"
  on public.capstone_reviews for select
  using (auth.uid() = reviewer_id);

create policy "Pro users can insert reviews on open submissions"
  on public.capstone_reviews for insert
  with check (
    subscription_status(auth.uid()) = 'pro'
    and exists (
      select 1 from public.capstone_submissions
      where id = submission_id and peer_review_open = true
    )
  );
