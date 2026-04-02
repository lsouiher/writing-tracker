'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou mot de passe incorrect')
      setLoading(false)
      return
    }

    window.location.href = '/dashboard'
  }

  async function handleGoogleLogin() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-display text-3xl text-primary block text-center mb-8">
          IAlgeria
        </Link>

        <div className="bg-surface rounded-xl border border-border p-6">
          <h1 className="font-display text-2xl text-center mb-6">Connexion</h1>

          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-surface-alt transition-colors mb-6"
          >
            Continuer avec Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-light">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
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
              placeholder="Votre mot de passe"
              required
            />
            {error && <p className="text-sm text-error">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          <p className="text-sm text-muted text-center mt-4">
            Pas encore de compte?{' '}
            <Link href="/register" className="text-primary font-medium">
              S&apos;inscrire
            </Link>
          </p>
          <p className="text-xs text-text-light text-center mt-2">
            <Link href="/reset-password">Mot de passe oublie?</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
