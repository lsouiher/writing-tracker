import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getUserCertificates } from '@/lib/supabase/queries/certificates'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mes certificats',
}

export default async function CertificatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/certificates')

  const certificates = await getUserCertificates(supabase, user.id)

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl mb-2">Mes certificats</h1>
      <p className="text-muted mb-8">
        Vos certificats de réussite pour les cours complétés.
      </p>

      {certificates.length > 0 ? (
        <div className="space-y-4">
          {certificates.map((cert) => {
            const issuedDate = new Date(cert.issued_at).toLocaleDateString('fr-FR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })

            return (
              <div
                key={cert.id}
                className="bg-surface rounded-xl border border-border p-6 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">{cert.course.title}</h3>
                  <p className="text-sm text-text-light">
                    Délivré le {issuedDate}
                  </p>
                  <p className="text-xs text-text-light font-mono mt-1">
                    Code : {cert.verification_code}
                  </p>
                </div>

                <div className="flex gap-3 shrink-0">
                  <a
                    href={cert.pdf_url}
                    className="text-sm text-primary font-medium hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Télécharger
                  </a>
                  <Link
                    href={`/verify/${cert.verification_code}`}
                    className="text-sm text-muted hover:text-primary"
                  >
                    Vérifier
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border p-10 text-center">
          <div className="w-16 h-16 bg-surface-alt rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-text-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="font-display text-xl mb-2">Pas encore de certificat</h2>
          <p className="text-muted text-sm mb-6 max-w-sm mx-auto">
            Complétez toutes les leçons, quiz et exercices d&apos;un cours pour obtenir votre certificat.
          </p>
          <Link href="/courses" className="text-primary text-sm font-medium">
            Explorer les cours
          </Link>
        </div>
      )}
    </main>
  )
}
