import type { SupabaseClient } from '@supabase/supabase-js'

export async function checkCertificateEligibility(
  supabase: SupabaseClient,
  userId: string,
  courseId: string
) {
  // Check all lessons completed
  const { data: course } = await supabase
    .from('courses')
    .select(`
      modules (
        id,
        lessons (id)
      )
    `)
    .eq('id', courseId)
    .single()

  if (!course?.modules) return { eligible: false, reason: 'Cours introuvable' }

  const allLessonIds = course.modules.flatMap(
    (m: { lessons: { id: string }[] }) => m.lessons.map((l) => l.id)
  )

  const { data: progress } = await supabase
    .from('progress')
    .select('lesson_id')
    .eq('user_id', userId)
    .eq('completed', true)
    .in('lesson_id', allLessonIds)

  const completedLessonIds = new Set((progress ?? []).map((p: { lesson_id: string }) => p.lesson_id))
  const allLessonsComplete = allLessonIds.every((id: string) => completedLessonIds.has(id))
  if (!allLessonsComplete) {
    return { eligible: false, reason: 'Toutes les leçons doivent être complétées' }
  }

  // Check all module quizzes passed
  const moduleIds = course.modules.map((m: { id: string }) => m.id)

  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('id, module_id')
    .in('module_id', moduleIds)

  if (quizzes && quizzes.length > 0) {
    for (const quiz of quizzes) {
      const { data: results } = await supabase
        .from('quiz_results')
        .select('passed')
        .eq('user_id', userId)
        .eq('quiz_id', quiz.id)
        .eq('passed', true)
        .limit(1)

      if (!results || results.length === 0) {
        return { eligible: false, reason: 'Tous les quiz doivent être réussis (≥70%)' }
      }
    }
  }

  // Check all module labs passed
  const { data: labs } = await supabase
    .from('labs')
    .select('id, module_id')
    .in('module_id', moduleIds)

  if (labs && labs.length > 0) {
    for (const lab of labs) {
      const { data: submissions } = await supabase
        .from('lab_submissions')
        .select('passed')
        .eq('user_id', userId)
        .eq('lab_id', lab.id)
        .eq('passed', true)
        .limit(1)

      if (!submissions || submissions.length === 0) {
        return { eligible: false, reason: 'Tous les exercices de code doivent être réussis' }
      }
    }
  }

  // Check capstone approved (if course has capstone submissions expected)
  const { data: capstone } = await supabase
    .from('capstone_submissions')
    .select('status')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single()

  if (!capstone || capstone.status !== 'approved') {
    return { eligible: false, reason: 'Le projet capstone doit être approuvé (score ≥ 70%)' }
  }

  // Check no existing certificate
  const { data: existing } = await supabase
    .from('certificates')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single()

  if (existing) {
    return { eligible: false, reason: 'Certificat déjà délivré pour ce cours' }
  }

  return { eligible: true, reason: null }
}

export async function createCertificate(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
  verificationCode: string,
  pdfUrl: string
) {
  const { data, error } = await supabase
    .from('certificates')
    .insert({
      user_id: userId,
      course_id: courseId,
      verification_code: verificationCode,
      pdf_url: pdfUrl,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getCertificateByCode(supabase: SupabaseClient, code: string) {
  const { data, error } = await supabase
    .from('certificates')
    .select(`
      *,
      user:users!inner(full_name),
      course:courses!inner(title)
    `)
    .eq('verification_code', code)
    .single()

  if (error) return null
  return data
}

export async function getUserCertificates(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('certificates')
    .select(`
      *,
      course:courses!inner(title, slug)
    `)
    .eq('user_id', userId)
    .order('issued_at', { ascending: false })

  if (error) return []
  return data
}
