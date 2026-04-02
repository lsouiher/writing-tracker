import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import { getTeamLicenseByAdmin, removeTeamMember } from '@/lib/supabase/queries/teams'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('UNAUTHORIZED', 'Connectez-vous pour continuer', 401)
    }

    // Verify user is a team admin
    const license = await getTeamLicenseByAdmin(supabase, user.id)

    if (!license) {
      return errorResponse('FORBIDDEN', "Vous n'avez pas de licence équipe active", 403)
    }

    await removeTeamMember(supabase, memberId)

    return successResponse({ removed: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Impossible de retirer le membre'
    return errorResponse('REMOVE_ERROR', message, 500)
  }
}
