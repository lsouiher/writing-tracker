import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserTier } from '@/lib/supabase/queries/subscriptions'
import { PaywallPrompt } from '@/components/ui/paywall-prompt'
import { MonacoLab } from '@/components/lab/monaco-lab'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { LabLanguage } from '@/types/domain'

export const metadata: Metadata = {
  title: 'Exercice de code',
}

export default async function LabPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>
}) {
  const { courseSlug, lessonSlug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/login?redirect=/courses/${courseSlug}/${lessonSlug}/lab`)

  const tier = await getUserTier(supabase, user.id)

  if (tier !== 'pro') {
    return (
      <main className="max-w-2xl mx-auto px-6 py-12">
        <PaywallPrompt feature="Les exercices de code" />
      </main>
    )
  }

  // Find the lab for this lesson's module
  const { data: lesson } = await supabase
    .from('lessons')
    .select('module_id, title, module:modules!inner(course:courses!inner(slug))')
    .eq('slug', lessonSlug)
    .single()

  if (!lesson) redirect(`/courses/${courseSlug}`)

  const { data: lab } = await supabase
    .from('labs')
    .select('*')
    .eq('module_id', lesson.module_id)
    .single()

  if (!lab) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-12 text-center">
        <p className="text-muted">Aucun exercice disponible pour ce module.</p>
        <Link href={`/courses/${courseSlug}/${lessonSlug}`} className="text-primary text-sm font-medium mt-4 inline-block">
          Retour à la leçon
        </Link>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <nav className="text-sm text-muted mb-6">
        <Link href={`/courses/${courseSlug}`} className="hover:text-primary">
          Cours
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/courses/${courseSlug}/${lessonSlug}`} className="hover:text-primary">
          {lesson.title}
        </Link>
        <span className="mx-2">/</span>
        <span>Exercice</span>
      </nav>

      <MonacoLab
        labId={lab.id}
        title={lab.title}
        description={lab.description}
        language={lab.language as LabLanguage}
        starterCode={lab.starter_code}
        testCases={lab.test_cases as { input: string; expected_output: string }[]}
      />
    </main>
  )
}
