import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import { getPublishedCourses } from '@/lib/supabase/queries/courses'
import { checkApiRateLimit } from '@/lib/redis/api-rate-limit'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const rateLimited = await checkApiRateLimit(request)
    if (rateLimited) return rateLimited
    const { searchParams } = request.nextUrl
    const level = searchParams.get('level') || undefined
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    const supabase = await createClient()
    const { courses, total } = await getPublishedCourses(supabase, level, page, limit)

    return successResponse({ courses, total, page, limit })
  } catch {
    return errorResponse('INTERNAL_ERROR', 'Impossible de charger les cours', 500)
  }
}
