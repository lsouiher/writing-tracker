import { createClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'
import { applyReferralReward } from './referrals'

// Use service role for webhook processing (bypasses RLS)
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const supabase = getServiceClient()
  const userId = session.metadata?.user_id
  const subscriptionId = session.subscription as string

  if (!userId || !subscriptionId) return

  await supabase.from('subscriptions').upsert({
    user_id: userId,
    stripe_customer_id: session.customer as string,
    stripe_subscription_id: subscriptionId,
    plan: 'monthly', // Will be updated by subscription.updated event
    status: 'trialing',
    currency: (session.currency || 'eur').toLowerCase(),
    price_region: session.metadata?.region || 'default',
    trial_ends_at: null,
    current_period_end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  }, { onConflict: 'stripe_subscription_id' })
}

export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const supabase = getServiceClient()
  const userId = subscription.metadata?.user_id

  if (!userId) return

  const status = mapStripeStatus(subscription.status)
  const plan = subscription.items.data[0]?.price?.recurring?.interval === 'year' ? 'annual' : 'monthly'

  await supabase.from('subscriptions').upsert({
    user_id: userId,
    stripe_customer_id: subscription.customer as string,
    stripe_subscription_id: subscription.id,
    plan,
    status,
    currency: subscription.currency || 'eur',
    price_region: subscription.metadata?.region || 'default',
    trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    current_period_end: new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
    canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
  }, { onConflict: 'stripe_subscription_id' })
}

export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabase = getServiceClient()

  await supabase
    .from('subscriptions')
    .update({ status: 'expired' })
    .eq('stripe_subscription_id', subscription.id)
}

export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const supabase = getServiceClient()
  const subscriptionId = (invoice as unknown as { subscription: string }).subscription

  if (!subscriptionId) return

  await supabase
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', subscriptionId)

  // TODO: Send payment-failed email via Resend
}

export async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const supabase = getServiceClient()
  const subscriptionId = (invoice as unknown as { subscription: string }).subscription

  if (!subscriptionId) return

  const periodEnd = invoice.lines.data[0]?.period?.end
  const updates: Record<string, unknown> = { status: 'active' }
  if (periodEnd) {
    updates.current_period_end = new Date(periodEnd * 1000).toISOString()
  }

  await supabase
    .from('subscriptions')
    .update(updates)
    .eq('stripe_subscription_id', subscriptionId)

  // Check for pending referral and complete it
  await processReferralReward(supabase, subscriptionId)
}

async function processReferralReward(
  supabase: ReturnType<typeof getServiceClient>,
  stripeSubscriptionId: string
) {
  // Get the subscription to find the user
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('user_id, stripe_customer_id')
    .eq('stripe_subscription_id', stripeSubscriptionId)
    .single()

  if (!subscription) return

  // Check if this user was referred and has a pending referral
  const { data: referral } = await supabase
    .from('referrals')
    .select('id, referrer_id')
    .eq('referee_id', subscription.user_id)
    .eq('status', 'pending')
    .single()

  if (!referral) return

  // Get the referrer's Stripe customer ID
  const { data: referrerSub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', referral.referrer_id)
    .in('status', ['active', 'trialing'])
    .single()

  if (!referrerSub) return

  // Apply Stripe credits to both parties
  try {
    await applyReferralReward(referrerSub.stripe_customer_id, subscription.stripe_customer_id)

    // Mark referral as completed with reward applied
    await supabase
      .from('referrals')
      .update({
        status: 'completed',
        reward_applied: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', referral.id)
  } catch (err) {
    console.error('Failed to apply referral reward:', err)
    // Still complete the referral even if reward fails
    await supabase
      .from('referrals')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', referral.id)
  }
}

export async function handleTeamCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (session.metadata?.type !== 'team') return

  const supabase = getServiceClient()
  const userId = session.metadata?.user_id
  const subscriptionId = session.subscription as string
  const seatCount = parseInt(session.metadata?.seat_count || '0', 10)

  if (!userId || !subscriptionId || !seatCount) return

  // Create team license
  await supabase.from('team_licenses').insert({
    admin_id: userId,
    stripe_subscription_id: subscriptionId,
    seat_count: seatCount,
    seats_used: 0,
    status: 'active',
  })

  // Update user role to team_admin
  await supabase
    .from('users')
    .update({ role: 'team_admin' })
    .eq('id', userId)
}

export async function handleTeamSubscriptionDeleted(subscription: Stripe.Subscription) {
  const supabase = getServiceClient()

  // Expire the team license
  const { data: license } = await supabase
    .from('team_licenses')
    .update({ status: 'expired' })
    .eq('stripe_subscription_id', subscription.id)
    .select('id')
    .single()

  if (!license) return

  // Soft-remove all team members
  await supabase
    .from('team_members')
    .update({ removed_at: new Date().toISOString() })
    .eq('team_license_id', license.id)
    .is('removed_at', null)
}

function mapStripeStatus(stripeStatus: string): string {
  const map: Record<string, string> = {
    trialing: 'trialing',
    active: 'active',
    past_due: 'past_due',
    canceled: 'canceled',
    unpaid: 'expired',
    incomplete: 'trialing',
    incomplete_expired: 'expired',
  }
  return map[stripeStatus] || 'expired'
}
