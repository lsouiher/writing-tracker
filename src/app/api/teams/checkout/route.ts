import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe/client'
import { successResponse, errorResponse } from '@/lib/api/response'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('UNAUTHORIZED', 'Connectez-vous pour continuer', 401)
    }

    const body = await request.json()
    const seatCount = body.seat_count

    if (typeof seatCount !== 'number' || seatCount < 5 || seatCount > 50) {
      return errorResponse('VALIDATION_ERROR', 'Le nombre de places doit être entre 5 et 50', 400)
    }

    const stripe = getStripe()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: process.env.STRIPE_TEAM_PRICE_ID!,
          quantity: seatCount,
        },
      ],
      metadata: {
        user_id: user.id,
        type: 'team',
        seat_count: String(seatCount),
      },
      success_url: `${siteUrl}/teams/dashboard?checkout=success`,
      cancel_url: `${siteUrl}/pricing?checkout=canceled`,
      customer_email: user.email,
    })

    return successResponse({ checkout_url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur lors de la création du paiement'
    return errorResponse('CHECKOUT_ERROR', message, 500)
  }
}
