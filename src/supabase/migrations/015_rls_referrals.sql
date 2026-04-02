-- T105: RLS for referrals

alter table public.referrals enable row level security;

-- Referrers can read own referrals
create policy "Users can read own referrals as referrer"
  on public.referrals for select
  using (auth.uid() = referrer_id);
