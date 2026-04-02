'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'

export function CreateCouponForm() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [discountPercent, setDiscountPercent] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        discount_percent: parseInt(discountPercent, 10),
        max_uses: parseInt(maxUses, 10),
        expires_at: expiresAt || undefined,
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (data.error) {
      setError(data.error.message)
      return
    }

    setCode('')
    setDiscountPercent('')
    setMaxUses('')
    setExpiresAt('')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-lg p-6">
      <h2 className="font-display text-xl mb-4">Creer un coupon</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          label="Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="EARLYBIRD50"
          required
        />
        <Input
          label="Remise (%)"
          type="number"
          min={1}
          max={100}
          value={discountPercent}
          onChange={(e) => setDiscountPercent(e.target.value)}
          placeholder="50"
          required
        />
        <Input
          label="Utilisations max"
          type="number"
          min={1}
          value={maxUses}
          onChange={(e) => setMaxUses(e.target.value)}
          placeholder="100"
          required
        />
        <Input
          label="Expiration (optionnel)"
          type="date"
          value={expiresAt}
          onChange={(e) => setExpiresAt(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-error mt-3">{error}</p>}
      <Button type="submit" className="mt-4" disabled={loading}>
        {loading ? 'Creation...' : 'Creer le coupon'}
      </Button>
    </form>
  )
}
