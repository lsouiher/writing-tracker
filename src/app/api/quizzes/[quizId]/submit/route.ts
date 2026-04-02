import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import { getUserTier } from '@/lib/supabase/queries/subscriptions'
import { submitQuizResult } from '@/lib/supabase/queries/quizzes'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('UNAUTHORIZED', 'Connectez-vous pour soumettre un quiz', 401)
    }

    const tier = await getUserTier(supabase, user.id)
    if (tier !== 'pro') {
      return errorResponse('FORBIDDEN', 'Les quiz sont réservés aux abonnés Pro', 403)
    }

    const body = await request.json()
    const { answers } = body

    if (!answers || !Array.isArray(answers)) {
      return errorResponse('BAD_REQUEST', 'Les réponses sont requises', 400)
    }

    const result = await submitQuizResult(supabase, user.id, quizId, answers)

    return successResponse(result)
  } catch {
    return errorResponse('INTERNAL_ERROR', 'Impossible de soumettre le quiz', 500)
  }
}
