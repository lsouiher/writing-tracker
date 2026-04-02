import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api/response'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('UNAUTHORIZED', 'Connectez-vous pour acceder au tableau de bord', 401)
    }

    // Eager loading: single query with nested selects to prevent N+1
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select(`
        course_id,
        enrolled_at,
        courses:course_id (
          slug, title, thumbnail_url, level, duration_minutes,
          modules (
            id, title, sort_order,
            lessons (
              id, title, sort_order
            )
          )
        )
      `)
      .eq('user_id', user.id)

    // Get all progress for this user in one query
    const { data: allProgress } = await supabase
      .from('progress')
      .select('lesson_id, completed')
      .eq('user_id', user.id)

    const progressMap = new Map(
      (allProgress || []).map((p: { lesson_id: string; completed: boolean }) => [p.lesson_id, p.completed])
    )

    // Get subscription status
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status, plan, current_period_end')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .single()

    // Get certificates
    const { data: certificates } = await supabase
      .from('certificates')
      .select('verification_code, pdf_url, issued_at, courses:course_id(title)')
      .eq('user_id', user.id)

    // Compute progress percentages
    const enrichedEnrollments = (enrollments || []).map((e: Record<string, unknown>) => {
      const course = e.courses as Record<string, unknown>
      const modules = (course?.modules || []) as Record<string, unknown>[]
      let totalLessons = 0
      let completedLessons = 0

      for (const mod of modules) {
        const lessons = (mod.lessons || []) as Record<string, unknown>[]
        for (const lesson of lessons) {
          totalLessons++
          if (progressMap.get(lesson.id as string)) completedLessons++
        }
      }

      return {
        course_slug: course?.slug,
        course_title: course?.title,
        progress_percent: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      }
    })

    return successResponse({
      enrollments: enrichedEnrollments,
      certificates: certificates || [],
      subscription: subscription || null,
    })
  } catch {
    return errorResponse('INTERNAL_ERROR', 'Impossible de charger le tableau de bord', 500)
  }
}
