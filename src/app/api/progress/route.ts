import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import { upsertLessonProgress } from '@/lib/supabase/queries/progress'
import { checkApiRateLimit } from '@/lib/redis/api-rate-limit'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const rateLimited = await checkApiRateLimit(request, 'mutation')
    if (rateLimited) return rateLimited
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('UNAUTHORIZED', 'Connectez-vous pour sauvegarder votre progression', 401)
    }

    const body = await request.json()
    const { lesson_id, position_seconds, watched_seconds, lesson_duration } = body

    if (!lesson_id || position_seconds === undefined) {
      return errorResponse('BAD_REQUEST', 'lesson_id et position_seconds sont requis', 400)
    }

    const progress = await upsertLessonProgress(
      supabase,
      user.id,
      lesson_id,
      position_seconds,
      watched_seconds ?? position_seconds,
      lesson_duration ?? 0
    )

    return successResponse({ updated: true, completed: progress.completed })
  } catch {
    return errorResponse('INTERNAL_ERROR', 'Impossible de sauvegarder la progression', 500)
  }
}
