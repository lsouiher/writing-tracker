import { requireAdminApi } from '@/lib/admin/api-guard'
import { successResponse, errorResponse } from '@/lib/api/response'

// GET /api/admin/courses — list all courses with module/lesson counts
export async function GET() {
  const auth = await requireAdminApi()
  if (auth.error) return auth.error

  const { supabase } = auth

  const { data: courses } = await supabase
    .from('courses')
    .select(`
      *,
      modules (
        id,
        title,
        slug,
        sort_order,
        lessons (id)
      )
    `)
    .order('sort_order', { ascending: true })

  const formatted = (courses || []).map((c) => ({
    ...c,
    module_count: c.modules?.length || 0,
    lesson_count: c.modules?.reduce((sum: number, m: { lessons: unknown[] }) => sum + (m.lessons?.length || 0), 0) || 0,
    modules: undefined,
  }))

  return successResponse({ courses: formatted })
}

// POST /api/admin/courses — create a new course
export async function POST(request: Request) {
  const auth = await requireAdminApi()
  if (auth.error) return auth.error

  const { supabase } = auth
  const body = await request.json()
  const { slug, title, description, level, duration_minutes, thumbnail_url, is_published } = body

  if (!slug || !title || !description || !level) {
    return errorResponse('MISSING_FIELDS', 'slug, title, description, et level sont requis')
  }

  const { data: course, error } = await supabase
    .from('courses')
    .insert({
      slug,
      title,
      description,
      level,
      duration_minutes: duration_minutes || 0,
      thumbnail_url: thumbnail_url || '',
      is_published: is_published || false,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return errorResponse('DUPLICATE_SLUG', 'Ce slug existe deja')
    }
    return errorResponse('CREATE_FAILED', 'Erreur lors de la creation', 500)
  }

  return successResponse({ course }, 201)
}
