import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PaywallPromptProps {
  feature: string
}

export function PaywallPrompt({ feature }: PaywallPromptProps) {
  return (
    <div className="bg-surface rounded-xl border border-border p-8 text-center">
      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h3 className="font-display text-xl mb-2">
        Fonctionnalite Pro
      </h3>
      <p className="text-muted text-sm mb-6 max-w-sm mx-auto">
        {feature} est reserve aux abonnes Pro. Commencez votre essai
        gratuit de 7 jours pour debloquer toutes les fonctionnalites.
      </p>
      <Link href="/pricing">
        <Button variant="accent">
          Essai gratuit de 7 jours
        </Button>
      </Link>
      <p className="text-xs text-text-light mt-3">
        Annulable a tout moment. Aucun engagement.
      </p>
    </div>
  )
}
