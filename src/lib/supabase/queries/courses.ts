import type { SupabaseClient } from '@supabase/supabase-js'

export async function getPublishedCourses(
  supabase: SupabaseClient,
  level?: string,
  page = 1,
  limit = 20
) {
  let query = supabase
    .from('courses')
    .select('*, modules(count)', { count: 'exact' })
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .range((page - 1) * limit, page * limit - 1)

  if (level) {
    query = query.eq('level', level)
  }

  const { data, count, error } = await query
  if (error) throw error
  return { courses: data, total: count ?? 0 }
}

export async function getCourseBySlug(supabase: SupabaseClient, slug: string) {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error) return null
  return data
}

export async function getCourseWithModules(supabase: SupabaseClient, slug: string) {
  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      modules (
        id, slug, title, description, sort_order,
        lessons (
          id, slug, title, duration_seconds, is_free_preview, sort_order
        )
      )
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error) return null

  // Sort modules and lessons by sort_order
  if (data?.modules) {
    data.modules.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
    for (const mod of data.modules) {
      if (mod.lessons) {
        mod.lessons.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order)
      }
    }
  }

  return data
}
