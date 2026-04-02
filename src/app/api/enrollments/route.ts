import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import { checkApiRateLimit } from '@/lib/redis/api-rate-limit'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const rateLimited = await checkApiRateLimit(request, 'mutation')
    if (rateLimited) return rateLimited
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('UNAUTHORIZED', 'Connectez-vous pour vous inscrire a un cours', 401)
    }

    const { course_id } = await request.json()

    if (!course_id) {
      return errorResponse('BAD_REQUEST', 'course_id est requis', 400)
    }

    const { data, error } = await supabase
      .from('enrollments')
      .upsert(
        { user_id: user.id, course_id },
        { onConflict: 'user_id,course_id' }
      )
      .select('id')
      .single()

    if (error) throw error

    return successResponse({ enrollment_id: data.id }, 201)
  } catch {
    return errorResponse('INTERNAL_ERROR', 'Impossible de s\'inscrire au cours', 500)
  }
}
