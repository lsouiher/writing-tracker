'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function UserRoleEditor({
  userId,
  currentRole,
}: {
  userId: string
  currentRole: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value
    if (newRole === currentRole) return

    if (!confirm(`Changer le role en "${newRole}" ?`)) {
      e.target.value = currentRole
      return
    }

    setLoading(true)
    await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <select
      defaultValue={currentRole}
      onChange={handleChange}
      disabled={loading}
      className="text-xs bg-surface-alt border border-border rounded px-2 py-1 cursor-pointer disabled:opacity-50"
    >
      <option value="student">student</option>
      <option value="team_admin">team_admin</option>
      <option value="admin">admin</option>
    </select>
  )
}
