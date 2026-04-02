import { createClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'

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
