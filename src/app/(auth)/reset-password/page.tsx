'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })

    setSent(true)
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-3xl text-primary block text-center mb-8">
          IAlgeria
        </Link>

        <div className="bg-surface rounded-xl border border-border p-6">
          <h1 className="font-display text-2xl text-center mb-6">
            Reinitialiser le mot de passe
          </h1>

          {sent ? (
            <p className="text-muted text-sm text-center">
              Si un compte existe pour <strong>{email}</strong>, vous recevrez
              un email avec un lien de reinitialisation.
            </p>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Envoi...' : 'Envoyer le lien'}
              </Button>
            </form>
          )}

          <p className="text-sm text-muted text-center mt-4">
            <Link href="/login" className="text-primary font-medium">
              Retour a la connexion
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
