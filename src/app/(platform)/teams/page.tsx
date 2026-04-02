'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface TeamMember {
  id: string
  invited_email: string
  accepted_at: string | null
  created_at: string
  user: { full_name: string; email: string } | null
}

interface TeamData {
  license: {
    id: string
    seat_count: number
    seats_used: number
    status: string
  }
  members: TeamMember[]
  stats: {
    total_enrollments: number
    total_completions: number
    member_count: number
  }
}

export default function TeamDashboardPage() {
  const [data, setData] = useState<TeamData | null>(null)
  const [loading, setLoading] = useState(true)
  const [inviteEmails, setInviteEmails] = useState('')
  const [inviting, setInviting] = useState(false)
  const [inviteResult, setInviteResult] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/teams/dashboard')
      const json = await res.json()
      if (json.data) setData(json.data)
      setLoading(false)
    }
    load()
  }, [])

  const handleInvite = useCallback(async () => {
    const emails = inviteEmails
      .split(/[,\n]/)
      .map((e) => e.trim())
      .filter((e) => e.includes('@'))

    if (emails.length === 0) return
    setInviting(true)
    setInviteResult(null)

    try {
      const res = await fetch('/api/teams/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails }),
      })

      const json = await res.json()
      if (json.data) {
        setInviteResult(`${json.data.invited} invitation(s) envoyée(s)`)
        setInviteEmails('')
        // Reload data
        const dashRes = await fetch('/api/teams/dashboard')
        const dashData = await dashRes.json()
        if (dashData.data) setData(dashData.data)
      } else {
        setInviteResult(json.error?.message || 'Erreur')
      }
    } catch {
      setInviteResult('Erreur réseau')
    } finally {
      setInviting(false)
    }
  }, [inviteEmails])

  const handleRemove = useCallback(async (memberId: string) => {
    if (!confirm('Retirer ce membre de l\'équipe ?')) return

    const res = await fetch(`/api/teams/members/${memberId}`, { method: 'DELETE' })
    if (res.ok) {
      setData((prev) =>
        prev
          ? {
              ...prev,
              members: prev.members.filter((m) => m.id !== memberId),
              license: { ...prev.license, seats_used: prev.license.seats_used - 1 },
            }
          : null
      )
    }
  }, [])

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-alt rounded w-1/3" />
          <div className="h-32 bg-surface-alt rounded" />
        </div>
      </main>
    )
  }

  if (!data) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-12 text-center">
        <h1 className="font-display text-2xl mb-4">Pas de licence équipe</h1>
        <p className="text-muted mb-6">Vous n&apos;avez pas encore de licence équipe active.</p>
        <a href="/teams">
          <Button variant="accent">Découvrir les licences équipe</Button>
        </a>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl mb-1">Tableau de bord équipe</h1>
          <p className="text-muted text-sm">Gérez votre équipe et suivez la progression.</p>
        </div>
        <Badge variant={data.license.status === 'active' ? 'success' : 'warning'}>
          {data.license.status === 'active' ? 'Actif' : data.license.status}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-surface rounded-xl border border-border p-5 text-center">
          <div className="text-2xl font-display text-primary">
            {data.license.seats_used}/{data.license.seat_count}
          </div>
          <div className="text-xs text-muted mt-1">Places utilisées</div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-5 text-center">
          <div className="text-2xl font-display">{data.stats.total_enrollments}</div>
          <div className="text-xs text-muted mt-1">Inscriptions totales</div>
        </div>
        <div className="bg-surface rounded-xl border border-border p-5 text-center">
          <div className="text-2xl font-display">{data.stats.total_completions}</div>
          <div className="text-xs text-muted mt-1">Leçons complétées</div>
        </div>
      </div>

      {/* Invite form */}
      <div className="bg-surface rounded-xl border border-border p-6 mb-8">
        <h2 className="font-medium mb-3">Inviter des membres</h2>
        <p className="text-muted text-sm mb-3">
          {data.license.seat_count - data.license.seats_used} place(s) disponible(s).
          Séparez les emails par une virgule ou un retour à la ligne.
        </p>
        <textarea
          value={inviteEmails}
          onChange={(e) => setInviteEmails(e.target.value)}
          placeholder="email1@company.com, email2@company.com"
          rows={3}
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:border-primary resize-none mb-3"
        />
        <div className="flex items-center gap-3">
          <Button onClick={handleInvite} disabled={inviting || !inviteEmails.trim()} variant="accent" size="sm">
            {inviting ? 'Envoi...' : 'Envoyer les invitations'}
          </Button>
          {inviteResult && <span className="text-sm text-muted">{inviteResult}</span>}
        </div>
      </div>

      {/* Member list */}
      <div>
        <h2 className="font-medium mb-4">Membres ({data.members.length})</h2>
        <div className="space-y-2">
          {data.members.map((member) => (
            <div
              key={member.id}
              className="bg-surface rounded-lg border border-border p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-sm">
                  {member.user?.full_name || member.invited_email}
                </p>
                <p className="text-xs text-text-light">
                  {member.user?.email || member.invited_email}
                  {!member.accepted_at && (
                    <span className="ml-2 text-warning">(invitation en attente)</span>
                  )}
                </p>
              </div>
              <button
                onClick={() => handleRemove(member.id)}
                className="text-xs text-error hover:underline"
              >
                Retirer
              </button>
            </div>
          ))}

          {data.members.length === 0 && (
            <p className="text-muted text-sm text-center py-6">
              Aucun membre pour le moment. Invitez votre équipe ci-dessus.
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
