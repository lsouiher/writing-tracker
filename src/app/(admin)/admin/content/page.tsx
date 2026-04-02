import { requireAdmin } from '@/lib/admin/guard'
import Link from 'next/link'
import { ContentActions } from './content-actions'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contenu',
}

export default async function AdminContentPage() {
  const { supabase } = await requireAdmin()

  const { data: courses } = await supabase
    .from('courses')
    .select(`
      *,
      modules (
        id,
        title,
        slug,
        sort_order,
        lessons (id)
      )
    `)
    .order('sort_order', { ascending: true })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl mb-2">Gestion du contenu</h1>
          <p className="text-muted">
            {(courses || []).length} cours sur la plateforme.
          </p>
        </div>
        <Link
          href="/admin/content/new"
          className="inline-flex items-center px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-light transition-colors"
        >
          Nouveau cours
        </Link>
      </div>

      {(courses || []).length > 0 ? (
        <div className="space-y-4">
          {(courses || []).map((course) => {
            const moduleCount = course.modules?.length || 0
            const lessonCount = course.modules?.reduce(
              (sum: number, m: { lessons: unknown[] }) => sum + (m.lessons?.length || 0), 0
            ) || 0

            return (
              <div
                key={course.id}
                className="bg-surface border border-border rounded-lg p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-display text-lg truncate">{course.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        course.is_published
                          ? 'bg-primary/10 text-primary'
                          : 'bg-surface-alt text-muted'
                      }`}>
                        {course.is_published ? 'Publie' : 'Brouillon'}
                      </span>
                    </div>
                    <p className="text-sm text-muted line-clamp-1 mb-2">{course.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted">
                      <span>{course.level}</span>
                      <span>{moduleCount} module{moduleCount !== 1 ? 's' : ''}</span>
                      <span>{lessonCount} lecon{lessonCount !== 1 ? 's' : ''}</span>
                      <span>{course.duration_minutes} min</span>
                      <span className="font-mono">/{course.slug}</span>
                    </div>
                  </div>
                  <ContentActions courseId={course.id} isPublished={course.is_published} />
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg p-8 text-center text-muted">
          Aucun cours. Creez votre premier cours.
        </div>
      )}
    </div>
  )
}
