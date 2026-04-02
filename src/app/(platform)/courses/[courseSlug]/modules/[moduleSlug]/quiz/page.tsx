import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserTier } from '@/lib/supabase/queries/subscriptions'
import { PaywallPrompt } from '@/components/ui/paywall-prompt'
import { QuizForm } from '@/components/course/quiz-form'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Quiz',
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ courseSlug: string; moduleSlug: string }>
}) {
  const { courseSlug, moduleSlug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/login?redirect=/courses/${courseSlug}/modules/${moduleSlug}/quiz`)

  const tier = await getUserTier(supabase, user.id)

  if (tier !== 'pro') {
    return (
      <main className="max-w-2xl mx-auto px-6 py-12">
        <PaywallPrompt feature="Les quiz" />
      </main>
    )
  }

  // Find the module and its quiz
  const { data: module } = await supabase
    .from('modules')
    .select('id, title, course:courses!inner(slug)')
    .eq('slug', moduleSlug)
    .single()

  if (!module) redirect(`/courses/${courseSlug}`)

  const { data: quiz } = await supabase
    .from('quizzes')
    .select('*')
    .eq('module_id', module.id)
    .single()

  if (!quiz) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-12 text-center">
        <p className="text-muted">Aucun quiz disponible pour ce module.</p>
        <Link href={`/courses/${courseSlug}`} className="text-primary text-sm font-medium mt-4 inline-block">
          Retour au cours
        </Link>
      </main>
    )
  }

  // Check if user has already passed this quiz
  const { data: bestResult } = await supabase
    .from('quiz_results')
    .select('score, passed')
    .eq('user_id', user.id)
    .eq('quiz_id', quiz.id)
    .eq('passed', true)
    .order('score', { ascending: false })
    .limit(1)
    .single()

  return (
    <main className="max-w-3xl mx-auto px-6 py-8">
      <nav className="text-sm text-muted mb-6">
        <Link href={`/courses/${courseSlug}`} className="hover:text-primary">
          Cours
        </Link>
        <span className="mx-2">/</span>
        <span>{module.title}</span>
        <span className="mx-2">/</span>
        <span>Quiz</span>
      </nav>

      {bestResult && (
        <div className="bg-success/5 border border-success/20 rounded-lg p-4 mb-6">
          <p className="text-sm text-success font-medium">
            Vous avez déjà réussi ce quiz avec un score de {bestResult.score}%.
            Vous pouvez le repasser pour améliorer votre score.
          </p>
        </div>
      )}

      <QuizForm
        quizId={quiz.id}
        title={quiz.title}
        questions={quiz.questions as { type: 'mcq' | 'short_answer'; question: string; options?: string[]; correct_answer: string; explanation: string }[]}
        passingScore={quiz.passing_score}
      />
    </main>
  )
}
