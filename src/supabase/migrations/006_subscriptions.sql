-- T046: Subscriptions and coupons tables

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  stripe_customer_id text not null,
  stripe_subscription_id text not null unique,
  plan text not null check (plan in ('monthly', 'annual')),
  status text not null check (status in ('trialing', 'active', 'past_due', 'canceled', 'expired')),
  currency text not null default 'eur' check (currency in ('eur', 'cad', 'usd')),
  price_region text not null default 'default' check (price_region in ('default', 'maghreb', 'west_africa', 'canada')),
  trial_ends_at timestamptz,
  current_period_end timestamptz not null,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_subscriptions_user on public.subscriptions(user_id);
create index idx_subscriptions_stripe_customer on public.subscriptions(stripe_customer_id);
create index idx_subscriptions_status on public.subscriptions(status);

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute procedure public.update_updated_at();

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_percent integer not null check (discount_percent between 1 and 100),
  max_uses integer not null,
  current_uses integer not null default 0,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
