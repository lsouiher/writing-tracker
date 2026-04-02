import { requireAdminApi } from '@/lib/admin/api-guard'
import { successResponse, errorResponse } from '@/lib/api/response'

// GET /api/admin/courses/[courseId] — get course with modules and lessons
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const auth = await requireAdminApi()
  if (auth.error) return auth.error

  const { supabase } = auth
  const { courseId } = await params

  const { data: course, error } = await supabase
    .from('courses')
    .select(`
      *,
      modules (
        *,
        lessons (*)
      )
    `)
    .eq('id', courseId)
    .order('sort_order', { referencedTable: 'modules', ascending: true })
    .single()

  if (error || !course) {
    return errorResponse('NOT_FOUND', 'Cours introuvable', 404)
  }

  return successResponse({ course })
}

// PATCH /api/admin/courses/[courseId] — update a course
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const auth = await requireAdminApi()
  if (auth.error) return auth.error

  const { supabase } = auth
  const { courseId } = await params
  const body = await request.json()

  // Only allow updating known fields
  const allowedFields = ['title', 'title_en', 'description', 'description_en', 'level', 'duration_minutes', 'thumbnail_url', 'is_published', 'sort_order']
  const updates: Record<string, unknown> = {}
  for (const key of allowedFields) {
    if (key in body) updates[key] = body[key]
  }

  if (Object.keys(updates).length === 0) {
    return errorResponse('NO_UPDATES', 'Aucun champ a mettre a jour')
  }

  const { data: course, error } = await supabase
    .from('courses')
    .update(updates)
    .eq('id', courseId)
    .select()
    .single()

  if (error || !course) {
    return errorResponse('UPDATE_FAILED', 'Erreur lors de la mise a jour', 500)
  }

  return successResponse({ course })
}

// DELETE /api/admin/courses/[courseId] — delete a course
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const auth = await requireAdminApi()
  if (auth.error) return auth.error

  const { supabase } = auth
  const { courseId } = await params

  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId)

  if (error) {
    return errorResponse('DELETE_FAILED', 'Erreur lors de la suppression', 500)
  }

  return successResponse({ deleted: true })
}
