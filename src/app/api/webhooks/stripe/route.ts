import { getStripe } from '@/lib/stripe/client'
import {
  handleCheckoutCompleted,
  handleTeamCheckoutCompleted,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleTeamSubscriptionDeleted,
  handleInvoicePaymentFailed,
  handleInvoicePaid,
} from '@/lib/stripe/webhooks'
import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.metadata?.type === 'team') {
          await handleTeamCheckoutCompleted(session)
        } else {
          await handleCheckoutCompleted(session)
        }
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        await handleTeamSubscriptionDeleted(subscription)
        break
      }
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice)
        break
      default:
        console.log(`Unhandled webhook event: ${event.type}`)
    }
  } catch (err) {
    console.error(`Webhook handler error for ${event.type}:`, err)
    // Return 500 so Stripe retries delivery for transient failures
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
