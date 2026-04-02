-- T080: RLS for community_posts, post_votes, moderation_flags

alter table public.community_posts enable row level security;
alter table public.post_votes enable row level security;
alter table public.moderation_flags enable row level security;

-- Community posts: authenticated read (non-removed), Pro write
create policy "Authenticated users can read non-removed posts"
  on public.community_posts for select
  using (auth.uid() is not null and is_removed = false);

create policy "Pro users can create posts"
  on public.community_posts for insert
  with check (
    auth.uid() = author_id
    and subscription_status(auth.uid()) = 'pro'
  );

create policy "Authors can update own posts"
  on public.community_posts for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

-- Post votes: Pro own rows
create policy "Users can read own votes"
  on public.post_votes for select
  using (auth.uid() = user_id);

create policy "Pro users can insert votes"
  on public.post_votes for insert
  with check (
    auth.uid() = user_id
    and subscription_status(auth.uid()) = 'pro'
  );

create policy "Users can delete own votes"
  on public.post_votes for delete
  using (auth.uid() = user_id);

-- Moderation flags: admin only
create policy "Admins can read moderation flags"
  on public.moderation_flags for select
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can manage moderation flags"
  on public.moderation_flags for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );
