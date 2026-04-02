-- T047: RLS for subscriptions and coupons

alter table public.subscriptions enable row level security;
alter table public.coupons enable row level security;

-- Subscriptions: users read own, server-only write (via service role in webhooks)
create policy "Users can read own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- Coupons: server-only (admin creates, checkout validates)
create policy "Admins can manage coupons"
  on public.coupons for all
  using (
    exists (
      select 1 from public.users
      where id = auth.uid() and role = 'admin'
    )
  );
