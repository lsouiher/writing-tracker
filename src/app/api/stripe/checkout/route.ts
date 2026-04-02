import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe/client'
import { getStripePriceId, getRegionFromCountry } from '@/lib/stripe/pricing'
import { successResponse, errorResponse } from '@/lib/api/response'
import { headers } from 'next/headers'
import type { SubscriptionPlan } from '@/types/domain'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('UNAUTHORIZED', 'Connectez-vous pour vous abonner', 401)
    }

    const body = await request.json()
    const plan: SubscriptionPlan = body.plan || 'monthly'
    const couponCode: string | undefined = body.coupon_code

    // Detect region from geolocation header (set by middleware)
    const headersList = await headers()
    const country = headersList.get('x-user-country')
    const region = getRegionFromCountry(country)
    const priceId = getStripePriceId(region, plan)

    if (!priceId) {
      return errorResponse('CONFIG_ERROR', 'Prix non configure pour cette region', 500)
    }

    const stripe = getStripe()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Build checkout session params
    const sessionParams: Record<string, unknown> = {
      mode: 'subscription' as const,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard?checkout=success`,
      cancel_url: `${appUrl}/pricing?checkout=canceled`,
      subscription_data: {
        trial_period_days: 7,
        metadata: { user_id: user.id, region },
      },
      customer_email: user.email,
      metadata: { user_id: user.id },
    }

    // Apply coupon if provided
    if (couponCode) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .single()

      if (coupon && coupon.current_uses < coupon.max_uses) {
        // Coupon is mapped to a Stripe coupon with same code
        (sessionParams as Record<string, unknown>).discounts = [{ coupon: couponCode.toUpperCase() }]
      }
    }

    const session = await stripe.checkout.sessions.create(sessionParams as Parameters<typeof stripe.checkout.sessions.create>[0])

    return successResponse({ checkout_url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur lors de la creation du paiement'
    return errorResponse('CHECKOUT_ERROR', message, 500)
  }
}
