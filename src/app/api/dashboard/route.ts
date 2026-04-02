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

    // Get quiz results and lab submissions for completion status
    const { data: quizResults } = await supabase
      .from('quiz_results')
      .select('quiz_id, passed')
      .eq('user_id', user.id)
      .eq('passed', true)

    const passedQuizIds = new Set((quizResults || []).map((r: { quiz_id: string }) => r.quiz_id))

    const { data: labSubmissions } = await supabase
      .from('lab_submissions')
      .select('lab_id, passed')
      .eq('user_id', user.id)
      .eq('passed', true)

    const passedLabIds = new Set((labSubmissions || []).map((s: { lab_id: string }) => s.lab_id))

    // Get all quizzes and labs keyed by module
    const allModuleIds = (enrollments || []).flatMap((e: Record<string, unknown>) => {
      const course = e.courses as Record<string, unknown>
      return ((course?.modules || []) as { id: string }[]).map((m) => m.id)
    })

    const { data: allQuizzes } = allModuleIds.length > 0
      ? await supabase.from('quizzes').select('id, module_id').in('module_id', allModuleIds)
      : { data: [] }

    const { data: allLabs } = allModuleIds.length > 0
      ? await supabase.from('labs').select('id, module_id').in('module_id', allModuleIds)
      : { data: [] }

    const quizByModule = new Map<string, string>()
    for (const q of allQuizzes || []) quizByModule.set(q.module_id, q.id)

    const labByModule = new Map<string, string>()
    for (const l of allLabs || []) labByModule.set(l.module_id, l.id)

    // Compute progress percentages with quiz/lab status
    const enrichedEnrollments = (enrollments || []).map((e: Record<string, unknown>) => {
      const course = e.courses as Record<string, unknown>
      const modules = (course?.modules || []) as Record<string, unknown>[]
      let totalLessons = 0
      let completedLessons = 0

      const moduleDetails = modules.map((mod) => {
        const lessons = (mod.lessons || []) as Record<string, unknown>[]
        let modCompleted = 0
        for (const lesson of lessons) {
          totalLessons++
          if (progressMap.get(lesson.id as string)) {
            completedLessons++
            modCompleted++
          }
        }

        const quizId = quizByModule.get(mod.id as string)
        const labId = labByModule.get(mod.id as string)

        return {
          title: mod.title,
          lessons_completed: modCompleted,
          lessons_total: lessons.length,
          quiz_passed: quizId ? passedQuizIds.has(quizId) : null,
          lab_passed: labId ? passedLabIds.has(labId) : null,
        }
      })

      return {
        course_slug: course?.slug,
        course_title: course?.title,
        progress_percent: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        modules: moduleDetails,
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
