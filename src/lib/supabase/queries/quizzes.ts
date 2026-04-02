import type { SupabaseClient } from '@supabase/supabase-js'

export async function getQuizByModule(supabase: SupabaseClient, moduleId: string) {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('module_id', moduleId)
    .single()

  if (error) return null
  return data
}

export async function submitQuizResult(
  supabase: SupabaseClient,
  userId: string,
  quizId: string,
  answers: { question_index: number; answer: string }[]
) {
  // Fetch quiz to grade
  const { data: quiz, error: quizError } = await supabase
    .from('quizzes')
    .select('questions, passing_score')
    .eq('id', quizId)
    .single()

  if (quizError || !quiz) throw new Error('Quiz introuvable')

  const questions = quiz.questions as {
    type: string
    question: string
    options?: string[]
    correct_answer: string
    explanation: string
  }[]

  // Grade each answer
  const feedback = answers.map((a) => {
    const q = questions[a.question_index]
    if (!q) return { question_index: a.question_index, correct: false, explanation: '' }
    const correct = a.answer.toLowerCase().trim() === q.correct_answer.toLowerCase().trim()
    return { question_index: a.question_index, correct, explanation: q.explanation }
  })

  const correctCount = feedback.filter((f) => f.correct).length
  const score = Math.round((correctCount / questions.length) * 100)
  const passed = score >= quiz.passing_score

  // Save result
  const { error: insertError } = await supabase
    .from('quiz_results')
    .insert({
      user_id: userId,
      quiz_id: quizId,
      score,
      passed,
      answers,
    })

  if (insertError) throw insertError

  return { score, passed, feedback }
}

export async function getQuizResults(supabase: SupabaseClient, userId: string, courseId: string) {
  const { data, error } = await supabase
    .from('quiz_results')
    .select(`
      *,
      quiz:quizzes!inner(
        module:modules!inner(
          course_id
        )
      )
    `)
    .eq('user_id', userId)
    .eq('quiz.module.course_id', courseId)
    .order('completed_at', { ascending: false })

  if (error) return []
  return data
}
