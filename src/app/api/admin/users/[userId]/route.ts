import { requireAdminApi } from '@/lib/admin/api-guard'
import { successResponse, errorResponse } from '@/lib/api/response'

// GET /api/admin/users/[userId] — get user details with subscription
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const auth = await requireAdminApi()
  if (auth.error) return auth.error

  const { supabase } = auth
  const { userId } = await params

  const [userResult, subResult] = await Promise.all([
    supabase.from('users').select('*').eq('id', userId).single(),
    supabase.from('subscriptions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).single(),
  ])

  if (userResult.error || !userResult.data) {
    return errorResponse('NOT_FOUND', 'Utilisateur introuvable', 404)
  }

  return successResponse({
    user: userResult.data,
    subscription: subResult.data || null,
  })
}

// PATCH /api/admin/users/[userId] — update user role
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const auth = await requireAdminApi()
  if (auth.error) return auth.error

  const { supabase } = auth
  const { userId } = await params
  const { role } = await request.json()

  if (!role || !['student', 'team_admin', 'admin'].includes(role)) {
    return errorResponse('INVALID_ROLE', 'Role invalide')
  }

  const { data: user, error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId)
    .select()
    .single()

  if (error || !user) {
    return errorResponse('UPDATE_FAILED', 'Erreur lors de la mise a jour', 500)
  }

  return successResponse({ user })
}
