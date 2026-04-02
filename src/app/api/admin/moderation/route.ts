import { requireAdminApi } from '@/lib/admin/api-guard'
import { successResponse } from '@/lib/api/response'

// GET /api/admin/moderation — list flagged posts pending review
export async function GET() {
  const auth = await requireAdminApi()
  if (auth.error) return auth.error

  const { supabase } = auth

  const { data: flags, error } = await supabase
    .from('moderation_flags')
    .select(`
      id,
      reason,
      reviewed,
      decision,
      created_at,
      reviewed_at,
      post:community_posts (
        id,
        title,
        body,
        author:users!community_posts_author_id_fkey (
          id,
          full_name,
          email
        )
      )
    `)
    .eq('reviewed', false)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Failed to fetch moderation flags:', error)
    return successResponse({ flags: [] })
  }

  return successResponse({ flags: flags || [] })
}
