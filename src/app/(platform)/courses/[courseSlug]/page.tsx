import { createClient } from '@/lib/supabase/server'
import { getCourseWithModules } from '@/lib/supabase/queries/courses'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseSlug: string }>
}) {
  const { courseSlug } = await params
  const supabase = await createClient()
  const course = await getCourseWithModules(supabase, courseSlug)

  if (!course) notFound()

  const levelLabels: Record<string, string> = {
    beginner: 'Debutant',
    intermediate: 'Intermediaire',
    advanced: 'Avance',
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <Badge variant="primary" className="mb-4">
        {levelLabels[course.level] || course.level}
      </Badge>
      <h1 className="font-display text-4xl mb-4">{course.title}</h1>
      <p className="text-muted text-lg mb-8 max-w-2xl">{course.description}</p>

      <div className="flex gap-6 text-sm text-muted mb-12">
        <span>{course.modules?.length || 0} modules</span>
        <span>{Math.round(course.duration_minutes / 60)} heures</span>
      </div>

      {/* Module list */}
      <div className="space-y-6">
        {course.modules?.map((mod: Record<string, unknown>, modIndex: number) => (
          <div key={mod.id as string} className="bg-surface rounded-xl border border-border p-6">
            <h2 className="font-display text-xl mb-1">
              Module {modIndex + 1}: {mod.title as string}
            </h2>
            <p className="text-sm text-muted mb-4">{mod.description as string}</p>

            <ul className="space-y-2">
              {(mod.lessons as Record<string, unknown>[])?.map(
                (lesson: Record<string, unknown>, lessonIndex: number) => (
                  <li key={lesson.id as string}>
                    <Link
                      href={`/courses/${courseSlug}/${lesson.slug}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-alt transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-text-light w-6">
                          {modIndex + 1}.{lessonIndex + 1}
                        </span>
                        <span className="text-sm">{lesson.title as string}</span>
                        {(lesson.is_free_preview as boolean) && (
                          <Badge variant="primary">Gratuit</Badge>
                        )}
                      </div>
                      <span className="text-xs text-text-light">
                        {Math.round((lesson.duration_seconds as number) / 60)} min
                      </span>
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Button variant="accent" size="lg">
          S&apos;inscrire a ce cours
        </Button>
      </div>
    </main>
  )
}
