import type { SupabaseClient } from '@supabase/supabase-js'
import type { SubscriptionTier } from '@/types/domain'

export async function getActiveSubscription(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .single()

  if (error) return null
  return data
}

export async function getUserTier(supabase: SupabaseClient, userId: string): Promise<SubscriptionTier> {
  const subscription = await getActiveSubscription(supabase, userId)
  return subscription ? 'pro' : 'free'
}

export async function upsertSubscription(
  supabase: SupabaseClient,
  data: {
    user_id: string
    stripe_customer_id: string
    stripe_subscription_id: string
    plan: string
    status: string
    currency: string
    price_region: string
    trial_ends_at: string | null
    current_period_end: string
    canceled_at: string | null
  }
) {
  const { error } = await supabase
    .from('subscriptions')
    .upsert(data, { onConflict: 'stripe_subscription_id' })

  if (error) throw error
}
