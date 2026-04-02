import { createClient } from '@/lib/supabase/server'
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

    // Soft delete: set deleted_at on user record (per Constitution IV)
    const { error } = await supabase
      .from('users')
      .update({ deleted_at: now })
      .eq('id', user.id)

    if (error) {
      return errorResponse('INTERNAL_ERROR', 'Impossible de supprimer le compte', 500)
    }

    // Anonymize community posts (keep content but remove attribution)
    await supabase
      .from('community_posts')
      .update({ author_id: null })
      .eq('author_id', user.id)

    // Cancel active subscriptions via marking for cancellation
    await supabase
      .from('subscriptions')
      .update({ status: 'canceled', canceled_at: now })
      .eq('user_id', user.id)
      .eq('status', 'active')

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
