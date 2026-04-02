import { createClient } from '@/lib/supabase/server'
import { getCertificateByCode } from '@/lib/supabase/queries/certificates'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Vérification de certificat — IAlgeria',
}

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const supabase = await createClient()
  const certificate = await getCertificateByCode(supabase, code)

  if (!certificate) {
    return (
      <main className="max-w-lg mx-auto px-6 py-24 text-center">
        <div className="bg-surface rounded-xl border border-border p-10">
          <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="font-display text-2xl mb-2">Certificat introuvable</h1>
          <p className="text-muted text-sm mb-6">
            Le code de vérification est invalide ou le certificat n&apos;existe pas.
          </p>
          <Link href="/" className="text-primary text-sm font-medium">
            Retour à l&apos;accueil
          </Link>
        </div>
      </main>
    )
  }

  const issuedDate = new Date(certificate.issued_at).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <main className="max-w-lg mx-auto px-6 py-24 text-center">
      <div className="bg-surface rounded-xl border border-border p-10">
        <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-display text-2xl mb-1">Certificat vérifié</h1>
        <p className="text-text-light text-xs mb-8 uppercase tracking-wider">
          Authenticité confirmée
        </p>

        <div className="space-y-4 text-left bg-background rounded-lg p-6">
          <div>
            <p className="text-xs text-text-light uppercase tracking-wide mb-1">Titulaire</p>
            <p className="font-medium text-lg">{certificate.user.full_name}</p>
          </div>
          <div>
            <p className="text-xs text-text-light uppercase tracking-wide mb-1">Cours complété</p>
            <p className="font-medium">{certificate.course.title}</p>
          </div>
          <div>
            <p className="text-xs text-text-light uppercase tracking-wide mb-1">Date de délivrance</p>
            <p className="font-medium">{issuedDate}</p>
          </div>
          <div>
            <p className="text-xs text-text-light uppercase tracking-wide mb-1">Code de vérification</p>
            <p className="font-mono text-sm text-muted">{code}</p>
          </div>
        </div>

        <p className="text-xs text-text-light mt-6">
          Ce certificat a été délivré par{' '}
          <Link href="/" className="text-primary">
            IAlgeria
          </Link>
        </p>
      </div>
    </main>
  )
}
