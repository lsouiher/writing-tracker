-- T013b: Subscription status function (used by all Pro-gated RLS policies)

create or replace function public.subscription_status(user_uuid uuid default auth.uid())
returns text as $$
declare
  tier text;
begin
  select
    case
      when s.status in ('active', 'trialing') then 'pro'
      else 'free'
    end into tier
  from public.subscriptions s
  where s.user_id = user_uuid
    and s.status in ('active', 'trialing')
  limit 1;

  return coalesce(tier, 'free');
end;
$$ language plpgsql security definer stable;
