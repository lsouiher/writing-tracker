import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import { getUserTier } from '@/lib/supabase/queries/subscriptions'
import { toggleVote } from '@/lib/supabase/queries/community'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('UNAUTHORIZED', 'Connectez-vous pour voter', 401)
    }

    const tier = await getUserTier(supabase, user.id)
    if (tier !== 'pro') {
      return errorResponse('FORBIDDEN', 'Le vote est réservé aux abonnés Pro', 403)
    }

    const result = await toggleVote(supabase, user.id, postId)

    return successResponse(result)
  } catch {
    return errorResponse('INTERNAL_ERROR', 'Impossible de voter', 500)
  }
}
