import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import { getCourseWithModules } from '@/lib/supabase/queries/courses'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createClient()
    const course = await getCourseWithModules(supabase, slug)

    if (!course) {
      return errorResponse('NOT_FOUND', 'Cours introuvable', 404)
    }

    return successResponse(course)
  } catch {
    return errorResponse('INTERNAL_ERROR', 'Impossible de charger le cours', 500)
  }
}
