'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function ContentActions({
  courseId,
  isPublished,
}: {
  courseId: string
  isPublished: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function togglePublish() {
    setLoading(true)
    await fetch(`/api/admin/courses/${courseId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !isPublished }),
    })
    setLoading(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm('Supprimer ce cours ? Cette action est irreversible.')) return
    setLoading(true)
    await fetch(`/api/admin/courses/${courseId}`, { method: 'DELETE' })
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex gap-2 shrink-0">
      <Button
        size="sm"
        variant="ghost"
        onClick={togglePublish}
        disabled={loading}
      >
        {isPublished ? 'Depublier' : 'Publier'}
      </Button>
      <Button
        size="sm"
        variant="danger"
        onClick={handleDelete}
        disabled={loading}
      >
        Supprimer
      </Button>
    </div>
  )
}
