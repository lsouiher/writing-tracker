import { requireAdminApi } from '@/lib/admin/api-guard'
import { successResponse, errorResponse } from '@/lib/api/response'
import type { ModerationDecision } from '@/types/domain'

// POST /api/admin/moderation/[flagId] — approve or remove flagged content
export async function POST(
  request: Request,
  { params }: { params: Promise<{ flagId: string }> }
) {
  const auth = await requireAdminApi()
  if (auth.error) return auth.error

  const { supabase, user } = auth
  const { flagId } = await params
  const { decision } = await request.json() as { decision: ModerationDecision }

  if (!decision || !['approved', 'removed'].includes(decision)) {
    return errorResponse('INVALID_DECISION', 'Decision doit etre "approved" ou "removed"')
  }

  // Update the moderation flag
  const { data: flag, error: flagError } = await supabase
    .from('moderation_flags')
    .update({
      reviewed: true,
      decision,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', flagId)
    .select('post_id')
    .single()

  if (flagError) {
    return errorResponse('FLAG_NOT_FOUND', 'Flag de moderation introuvable', 404)
  }

  // If removed, soft-delete the post
  if (decision === 'removed' && flag.post_id) {
    await supabase
      .from('community_posts')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', flag.post_id)
  }

  return successResponse({ flagId, decision })
}
