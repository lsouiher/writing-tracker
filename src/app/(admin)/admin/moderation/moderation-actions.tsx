'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function ModerationActions({ flagId }: { flagId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDecision(decision: 'approved' | 'removed') {
    setLoading(true)
    try {
      await fetch(`/api/admin/moderation/${flagId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2 shrink-0">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleDecision('approved')}
        disabled={loading}
      >
        Approuver
      </Button>
      <Button
        size="sm"
        variant="danger"
        onClick={() => handleDecision('removed')}
        disabled={loading}
      >
        Supprimer
      </Button>
    </div>
  )
}
