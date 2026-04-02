import type { SupabaseClient } from '@supabase/supabase-js'

export async function submitCapstone(
  supabase: SupabaseClient,
  userId: string,
  courseId: string,
  data: {
    title: string
    description: string
    repository_url?: string | null
    submitted_code?: string | null
  }
) {
  const { data: submission, error } = await supabase
    .from('capstone_submissions')
    .insert({
      user_id: userId,
      course_id: courseId,
      title: data.title,
      description: data.description,
      repository_url: data.repository_url ?? null,
      submitted_code: data.submitted_code ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return submission
}

export async function getCapstone(supabase: SupabaseClient, userId: string, courseId: string) {
  const { data, error } = await supabase
    .from('capstone_submissions')
    .select(`
      *,
      reviews:capstone_reviews(
        id, rating, comment, created_at,
        reviewer:users!reviewer_id(full_name)
      )
    `)
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .single()

  if (error) return null
  return data
}

export async function getOpenCapstones(supabase: SupabaseClient, courseId: string) {
  const { data, error } = await supabase
    .from('capstone_submissions')
    .select(`
      id, title, description, status, submitted_at,
      user:users!user_id(full_name)
    `)
    .eq('course_id', courseId)
    .eq('peer_review_open', true)
    .order('submitted_at', { ascending: false })

  if (error) return []
  return data
}

export async function submitReview(
  supabase: SupabaseClient,
  submissionId: string,
  reviewerId: string,
  data: { rating: number; comment: string }
) {
  const { data: review, error } = await supabase
    .from('capstone_reviews')
    .insert({
      submission_id: submissionId,
      reviewer_id: reviewerId,
      rating: data.rating,
      comment: data.comment,
    })
    .select()
    .single()

  if (error) throw error
  return review
}
