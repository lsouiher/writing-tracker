import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import { getPostWithReplies } from '@/lib/supabase/queries/community'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('UNAUTHORIZED', 'Connectez-vous pour accéder au forum', 401)
    }

    const post = await getPostWithReplies(supabase, postId)

    if (!post) {
      return errorResponse('NOT_FOUND', 'Discussion introuvable', 404)
    }

    // Check if user has voted on this post
    const { data: vote } = await supabase
      .from('post_votes')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .single()

    return successResponse({
      ...post,
      user_has_voted: !!vote,
    })
  } catch {
    return errorResponse('INTERNAL_ERROR', 'Impossible de charger la discussion', 500)
  }
}
