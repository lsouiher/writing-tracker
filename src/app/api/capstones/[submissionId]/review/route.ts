import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import { getUserTier } from '@/lib/supabase/queries/subscriptions'
import { submitReview } from '@/lib/supabase/queries/capstones'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    const { submissionId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('UNAUTHORIZED', 'Connectez-vous pour évaluer un projet', 401)
    }

    const tier = await getUserTier(supabase, user.id)
    if (tier !== 'pro') {
      return errorResponse('FORBIDDEN', "L'évaluation par les pairs est réservée aux abonnés Pro", 403)
    }

    // Verify submission exists and is open for review
    const { data: submission } = await supabase
      .from('capstone_submissions')
      .select('id, user_id, peer_review_open')
      .eq('id', submissionId)
      .single()

    if (!submission) {
      return errorResponse('NOT_FOUND', 'Soumission introuvable', 404)
    }

    if (!submission.peer_review_open) {
      return errorResponse('FORBIDDEN', "Cette soumission n'est pas ouverte aux évaluations", 403)
    }

    if (submission.user_id === user.id) {
      return errorResponse('BAD_REQUEST', 'Vous ne pouvez pas évaluer votre propre projet', 400)
    }

    const body = await request.json()
    const { rating, comment } = body

    if (!rating || !comment || rating < 1 || rating > 5) {
      return errorResponse('BAD_REQUEST', 'Une note (1-5) et un commentaire sont requis', 400)
    }

    const review = await submitReview(supabase, submissionId, user.id, { rating, comment })

    return successResponse({ review_id: review.id }, 201)
  } catch {
    return errorResponse('INTERNAL_ERROR', "Impossible de soumettre l'évaluation", 500)
  }
}
