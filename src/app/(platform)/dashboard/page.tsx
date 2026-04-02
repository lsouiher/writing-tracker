import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProgressBar } from '@/components/course/progress-bar'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tableau de bord',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/dashboard')

  // Fetch dashboard data via internal API
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/dashboard`, {
    headers: { cookie: '' }, // Server component: headers forwarded by middleware
    cache: 'no-store',
  })

  const { data } = await res.json()
  const enrollments = data?.enrollments || []
  const certificates = data?.certificates || []
  const subscription = data?.subscription

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl mb-2">Tableau de bord</h1>
      <p className="text-muted mb-8">
        Bienvenue, continuez votre apprentissage.
      </p>

      {/* Subscription status */}
      {subscription && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-8">
          <p className="text-sm font-medium text-primary">
            Pro {subscription.status === 'trialing' ? '(Essai gratuit)' : ''}
          </p>
        </div>
      )}

      {/* Enrolled courses */}
      <section className="mb-12">
        <h2 className="font-display text-xl mb-4">Mes cours</h2>
        {enrollments.length > 0 ? (
          <div className="space-y-4">
            {enrollments.map((e: Record<string, unknown>) => (
              <div
                key={e.course_slug as string}
                className="bg-surface rounded-xl border border-border p-5"
              >
                <Link
                  href={`/courses/${e.course_slug}`}
                  className="block hover:text-primary transition-colors"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium">{e.course_title as string}</h3>
                    <span className="text-sm text-primary font-medium">
                      {e.progress_percent as number}%
                    </span>
                  </div>
                  <ProgressBar value={e.progress_percent as number} />
                </Link>
                {(e.modules as Record<string, unknown>[])?.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {(e.modules as Record<string, unknown>[]).map((mod, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs text-muted">
                        <span>{mod.title as string}</span>
                        <div className="flex items-center gap-3">
                          <span>{mod.lessons_completed as number}/{mod.lessons_total as number} leçons</span>
                          {mod.quiz_passed !== null && (
                            <span className={mod.quiz_passed ? 'text-success' : 'text-text-light'}>
                              Quiz {mod.quiz_passed ? '✓' : '—'}
                            </span>
                          )}
                          {mod.lab_passed !== null && (
                            <span className={mod.lab_passed ? 'text-success' : 'text-text-light'}>
                              Lab {mod.lab_passed ? '✓' : '—'}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface rounded-xl border border-border p-8 text-center">
            <p className="text-muted mb-4">Vous n&apos;etes inscrit a aucun cours.</p>
            <Link href="/courses" className="text-primary font-medium text-sm">
              Decouvrir les cours
            </Link>
          </div>
        )}
      </section>

      {/* Certificates */}
      {certificates.length > 0 && (
        <section>
          <h2 className="font-display text-xl mb-4">Mes certificats</h2>
          <div className="space-y-3">
            {certificates.map((cert: Record<string, unknown>) => (
              <div key={cert.verification_code as string} className="bg-surface rounded-lg border border-border p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{(cert.courses as Record<string, unknown>)?.title as string}</p>
                  <p className="text-xs text-text-light">
                    {new Date(cert.issued_at as string).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <a
                  href={cert.pdf_url as string}
                  className="text-sm text-primary font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Telecharger
                </a>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
