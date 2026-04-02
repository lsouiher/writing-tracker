'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function UserSearch({
  currentSearch,
  currentRole,
}: {
  currentSearch: string
  currentRole: string
}) {
  const router = useRouter()
  const [search, setSearch] = useState(currentSearch)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (currentRole) params.set('role', currentRole)
    router.push(`/admin/users?${params.toString()}`)
  }

  function handleRoleFilter(role: string) {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (role) params.set('role', role)
    router.push(`/admin/users?${params.toString()}`)
  }

  const roles = [
    { value: '', label: 'Tous' },
    { value: 'student', label: 'Etudiants' },
    { value: 'team_admin', label: 'Admin equipe' },
    { value: 'admin', label: 'Admins' },
  ]

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <form onSubmit={handleSubmit} className="flex gap-2 flex-1">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou email..."
          className="flex-1"
        />
        <Button type="submit" size="sm">
          Rechercher
        </Button>
      </form>
      <div className="flex gap-1">
        {roles.map((r) => (
          <button
            key={r.value}
            onClick={() => handleRoleFilter(r.value)}
            className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
              currentRole === r.value
                ? 'bg-primary text-white'
                : 'bg-surface border border-border hover:bg-surface-alt'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  )
}
