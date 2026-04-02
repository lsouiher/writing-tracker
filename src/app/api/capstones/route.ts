import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import { getUserTier } from '@/lib/supabase/queries/subscriptions'
import { submitCapstone } from '@/lib/supabase/queries/capstones'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('UNAUTHORIZED', 'Connectez-vous pour soumettre un projet', 401)
    }

    const tier = await getUserTier(supabase, user.id)
    if (tier !== 'pro') {
      return errorResponse('FORBIDDEN', 'Les projets capstone sont réservés aux abonnés Pro', 403)
    }

    const body = await request.json()
    const { course_id, title, description, repository_url, submitted_code } = body

    if (!course_id || !title || !description) {
      return errorResponse('BAD_REQUEST', 'course_id, title et description sont requis', 400)
    }

    const submission = await submitCapstone(supabase, user.id, course_id, {
      title,
      description,
      repository_url,
      submitted_code,
    })

    return successResponse({ submission_id: submission.id, status: 'submitted' }, 201)
  } catch {
    return errorResponse('INTERNAL_ERROR', 'Impossible de soumettre le projet', 500)
  }
}
