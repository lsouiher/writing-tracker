'use client'

import { Suspense, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  )
}

function RegisterForm() {
  const searchParams = useSearchParams()
  const referralCode = searchParams.get('ref')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Track referral if a code was provided and signup succeeded
    if (referralCode && signUpData.user) {
      try {
        await fetch('/api/referrals/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ referralCode }),
        })
      } catch {
        // Non-blocking: referral tracking failure shouldn't block signup
      }
    }

    setSuccess(true)
    setLoading(false)
  }

  async function handleGoogleRegister() {
    const supabase = createClient()
    const redirectUrl = referralCode
      ? `${window.location.origin}/dashboard?ref=${referralCode}`
      : `${window.location.origin}/dashboard`
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectUrl },
    })
  }

  if (success) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <Link href="/" className="font-display text-3xl text-primary block mb-8">
            IAlgeria
          </Link>
          <div className="bg-surface rounded-xl border border-border p-6">
            <h1 className="font-display text-2xl mb-4">Verifiez votre email</h1>
            <p className="text-muted text-sm">
              Nous avons envoye un lien de confirmation a <strong>{email}</strong>.
              Cliquez dessus pour activer votre compte.
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-3xl text-primary block text-center mb-8">
          IAlgeria
        </Link>

        <div className="bg-surface rounded-xl border border-border p-6">
          <h1 className="font-display text-2xl text-center mb-6">Creer un compte</h1>

          <button
            onClick={handleGoogleRegister}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-surface-alt transition-colors mb-6"
          >
            Continuer avec Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-light">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Nom complet"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ahmed Benali"
              required
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
            />
            <Input
              label="Mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 caracteres"
              minLength={8}
              required
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creation...' : 'Creer mon compte'}
            </Button>
          </form>

          <p className="text-sm text-muted text-center mt-4">
            Deja inscrit?{' '}
            <Link href="/login" className="text-primary font-medium">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
