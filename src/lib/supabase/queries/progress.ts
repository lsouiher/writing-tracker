import type { SupabaseClient } from '@supabase/supabase-js'

const COMPLETION_THRESHOLD = 0.8 // 80% watch time required

export async function getUserProgress(
  supabase: SupabaseClient,
  userId: string,
  courseId: string
) {
  // Step 1: Get module IDs for this course
  const { data: modules } = await supabase
    .from('modules')
    .select('id')
    .eq('course_id', courseId)

  if (!modules?.length) return []

  // Step 2: Get lesson IDs for those modules
  const { data: lessons } = await supabase
    .from('lessons')
    .select('id')
    .in('module_id', modules.map((m: { id: string }) => m.id))

  if (!lessons?.length) return []

  // Step 3: Get progress for those lessons
  const { data, error } = await supabase
    .from('progress')
    .select('lesson_id, completed, last_position_seconds, watched_seconds')
    .eq('user_id', userId)
    .in('lesson_id', lessons.map((l: { id: string }) => l.id))

  if (error) return []
  return data
}

export async function upsertLessonProgress(
  supabase: SupabaseClient,
  userId: string,
  lessonId: string,
  positionSeconds: number,
  watchedSeconds: number,
  lessonDuration: number
) {
  const completed = watchedSeconds >= lessonDuration * COMPLETION_THRESHOLD

  const { data, error } = await supabase
    .from('progress')
    .upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        last_position_seconds: positionSeconds,
        watched_seconds: watchedSeconds,
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      },
      { onConflict: 'user_id,lesson_id' }
    )
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getEnrollments(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('enrollments')
    .select(`
      id, enrolled_at,
      courses:course_id (
        id, slug, title, thumbnail_url, level, duration_minutes,
        modules (
          id, title, sort_order,
          lessons (
            id, title, sort_order,
            progress:progress!inner (completed)
          )
        )
      )
    `)
    .eq('user_id', userId)

  if (error) return []
  return data
}
