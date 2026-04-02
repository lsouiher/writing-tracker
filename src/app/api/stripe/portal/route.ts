import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe/client'
import { successResponse, errorResponse } from '@/lib/api/response'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('UNAUTHORIZED', 'Connectez-vous pour gerer votre abonnement', 401)
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (!subscription) {
      return errorResponse('NOT_FOUND', 'Aucun abonnement trouve', 404)
    }

    const stripe = getStripe()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${appUrl}/dashboard`,
    })

    return successResponse({ portal_url: session.url })
  } catch {
    return errorResponse('PORTAL_ERROR', 'Impossible d\'ouvrir le portail de gestion', 500)
  }
}
