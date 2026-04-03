import { createClient } from '@/lib/supabase/server'
import { getServiceClient } from '@/lib/supabase/service'
import { getStripe } from '@/lib/stripe/client'
import { successResponse, errorResponse } from '@/lib/api/response'
import { checkApiRateLimit } from '@/lib/redis/api-rate-limit'
import { NextRequest } from 'next/server'

export async function DELETE(request: NextRequest) {
  try {
    const rateLimited = await checkApiRateLimit(request, 'auth')
    if (rateLimited) return rateLimited

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('UNAUTHORIZED', 'Connectez-vous pour supprimer votre compte', 401)
    }

    const now = new Date().toISOString()
    const serviceClient = getServiceClient()

    // Soft delete: set deleted_at on user record (per Constitution IV)
    const { error } = await serviceClient
      .from('users')
      .update({ deleted_at: now })
      .eq('id', user.id)

    if (error) {
      return errorResponse('INTERNAL_ERROR', 'Impossible de supprimer le compte', 500)
    }

    // Anonymize community posts (mark as removed since author_id is NOT NULL)
    await serviceClient
      .from('community_posts')
      .update({ is_removed: true })
      .eq('author_id', user.id)

    // Cancel active Stripe subscriptions, then update DB
    const { data: activeSubs } = await serviceClient
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing', 'past_due'])

    if (activeSubs && activeSubs.length > 0) {
      const stripe = getStripe()
      await Promise.allSettled(
        activeSubs.map(sub =>
          stripe.subscriptions.cancel(sub.stripe_subscription_id)
        )
      )

      await serviceClient
        .from('subscriptions')
        .update({ status: 'canceled', canceled_at: now })
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing', 'past_due'])
    }

    // Sign out the user
    await supabase.auth.signOut()

    return successResponse({
      deleted: true,
      message: 'Votre compte a été supprimé. Vos données personnelles seront effacées sous 30 jours.',
    })
  } catch {
    return errorResponse('INTERNAL_ERROR', 'Impossible de supprimer le compte', 500)
  }
}
