import { createClient } from '@/lib/supabase/server'
import { getPublishedCourses } from '@/lib/supabase/queries/courses'
import { CourseCard } from '@/components/course/course-card'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cours en Intelligence Artificielle',
  description: 'Decouvrez nos cours gratuits en intelligence artificielle en francais. Du debutant a l\'avance, apprenez l\'IA a votre rythme.',
  openGraph: {
    title: 'Cours IA en Francais | IAlgeria',
    description: 'Formation IA gratuite en francais. Videos, labs interactifs, tuteur IA.',
  },
}

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ level?: string; page?: string }>
}) {
  const { level, page } = await searchParams
  const supabase = await createClient()
  const { courses, total } = await getPublishedCourses(
    supabase,
    level,
    parseInt(page || '1', 10)
  )

  const levels = [
    { value: '', label: 'Tous' },
    { value: 'beginner', label: 'Debutant' },
    { value: 'intermediate', label: 'Intermediaire' },
    { value: 'advanced', label: 'Avance' },
  ]

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <div className="mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">
          Formation
        </p>
        <h1 className="font-display text-4xl mb-4">
          Nos cours en intelligence artificielle
        </h1>
        <p className="text-muted text-lg max-w-2xl">
          Tous les cours video sont gratuits. Passez au Pro pour acceder aux
          laboratoires interactifs, quiz, certificats et tuteur IA.
        </p>
      </div>

      {/* Level filter tabs */}
      <div className="flex gap-2 mb-8">
        {levels.map((l) => (
          <a
            key={l.value}
            href={l.value ? `/courses?level=${l.value}` : '/courses'}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              (level || '') === l.value
                ? 'bg-primary text-white'
                : 'bg-surface-alt text-muted hover:text-foreground'
            }`}
          >
            {l.label}
          </a>
        ))}
      </div>

      {/* Course grid */}
      {courses && courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: Record<string, unknown>) => (
            <CourseCard
              key={course.id as string}
              slug={course.slug as string}
              title={course.title as string}
              description={course.description as string}
              level={course.level as 'beginner' | 'intermediate' | 'advanced'}
              durationMinutes={course.duration_minutes as number}
              thumbnailUrl={course.thumbnail_url as string}
              moduleCount={(course.modules as unknown[])?.length ?? 0}
              lessonCount={0}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted text-lg">Aucun cours disponible pour le moment.</p>
          <p className="text-text-light text-sm mt-2">Revenez bientot!</p>
        </div>
      )}
    </main>
  )
}
