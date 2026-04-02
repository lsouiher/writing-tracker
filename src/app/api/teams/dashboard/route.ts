import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import { getTeamLicenseByAdmin } from '@/lib/supabase/queries/teams'
import { getTeamProgress } from '@/lib/supabase/queries/teams'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('UNAUTHORIZED', 'Connectez-vous pour accéder au tableau de bord', 401)
    }

    const license = await getTeamLicenseByAdmin(supabase, user.id)

    if (!license) {
      return errorResponse('FORBIDDEN', "Vous n'avez pas de licence équipe active", 403)
    }

    const progress = await getTeamProgress(supabase, license.id)

    return successResponse({
      license: {
        id: license.id,
        seat_count: license.seat_count,
        seats_used: license.seats_used,
        status: license.status,
        created_at: license.created_at,
      },
      ...progress,
    })
  } catch {
    return errorResponse('INTERNAL_ERROR', 'Impossible de charger le tableau de bord équipe', 500)
  }
}
