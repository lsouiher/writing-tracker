'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export function ReferralLinkCopy({ referralCode }: { referralCode: string }) {
  const [copied, setCopied] = useState(false)

  const referralUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/register?ref=${referralCode}`
    : `/register?ref=${referralCode}`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(referralUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const input = document.createElement('input')
      input.value = referralUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex gap-3">
      <input
        type="text"
        readOnly
        value={referralUrl}
        className="flex-1 px-4 py-2.5 bg-surface-alt border border-border rounded-lg text-sm text-text font-mono select-all"
        onClick={(e) => (e.target as HTMLInputElement).select()}
      />
      <Button onClick={handleCopy} variant={copied ? 'ghost' : 'primary'}>
        {copied ? 'Copie !' : 'Copier'}
      </Button>
    </div>
  )
}
