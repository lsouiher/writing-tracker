'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AcceptInvitePage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const teamId = searchParams.get('team')
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token || !teamId) {
      setStatus('no-token')
      return
    }

    async function acceptInvite() {
      try {
        // The accept flow: user clicks link → lands here → we update the team_member record
        const res = await fetch('/api/teams/accept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, team_id: teamId }),
        })

        const json = await res.json()

        if (res.ok) {
          setStatus('success')
          setMessage('Vous avez rejoint l\'équipe avec succès !')
        } else {
          setStatus('error')
          setMessage(json.error?.message || 'Impossible d\'accepter l\'invitation')
        }
      } catch {
        setStatus('error')
        setMessage('Erreur réseau. Veuillez réessayer.')
      }
    }

    acceptInvite()
  }, [token, teamId])

  return (
    <main className="max-w-md mx-auto px-6 py-24 text-center">
      <div className="bg-surface rounded-xl border border-border p-10">
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h1 className="font-display text-xl mb-2">Acceptation en cours...</h1>
            <p className="text-muted text-sm">Nous activons votre accès Pro.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="font-display text-xl mb-2">Bienvenue dans l&apos;équipe !</h1>
            <p className="text-muted text-sm mb-6">{message}</p>
            <Link href="/dashboard">
              <Button variant="accent">Accéder au tableau de bord</Button>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="font-display text-xl mb-2">Erreur</h1>
            <p className="text-muted text-sm mb-6">{message}</p>
            <Link href="/login">
              <Button variant="ghost">Se connecter</Button>
            </Link>
          </>
        )}

        {status === 'no-token' && (
          <>
            <h1 className="font-display text-xl mb-2">Lien invalide</h1>
            <p className="text-muted text-sm mb-6">
              Ce lien d&apos;invitation est invalide ou a expiré.
            </p>
            <Link href="/">
              <Button variant="ghost">Retour à l&apos;accueil</Button>
            </Link>
          </>
        )}
      </div>
    </main>
  )
}
