import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tarifs',
  description: 'Choisissez votre plan: gratuit ou Pro. Essai gratuit de 7 jours. Tarifs adaptes a votre region.',
}

const freeFeatures = [
  'Tous les cours video en illimite',
  'Progression basique',
  'Forum communautaire (lecture)',
  'Newsletter hebdomadaire IA',
]

const proFeatures = [
  'Tout le plan Gratuit',
  'Laboratoires interactifs',
  'Quiz et evaluations',
  'Tuteur IA personnel',
  'Certificats verifiables',
  'Forum communautaire (ecriture)',
  'Projets capstone',
  'Parcours personnalise',
]

export default function PricingPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2">
          Tarifs
        </p>
        <h1 className="font-display text-4xl mb-4">
          Choisissez votre plan
        </h1>
        <p className="text-muted text-lg max-w-xl mx-auto">
          Les videos sont gratuites pour toujours. Le Pro debloque les outils
          d&apos;apprentissage avances pour accelerer votre progression.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {/* Free Plan */}
        <div className="bg-surface rounded-xl border border-border p-8">
          <h2 className="font-display text-2xl mb-1">Gratuit</h2>
          <p className="text-muted text-sm mb-6">Pour commencer votre parcours IA</p>
          <p className="text-3xl font-bold mb-6">
            0 <span className="text-base font-normal text-muted">EUR/mois</span>
          </p>
          <Link href="/register">
            <Button variant="ghost" className="w-full mb-6">
              Creer un compte
            </Button>
          </Link>
          <ul className="space-y-3">
            {freeFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-0.5">&#10003;</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pro Plan */}
        <div className="bg-surface rounded-xl border-2 border-primary p-8 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
            Recommande
          </div>
          <h2 className="font-display text-2xl mb-1">Pro</h2>
          <p className="text-muted text-sm mb-6">Pour maitriser l&apos;IA et le prouver</p>
          <p className="text-3xl font-bold mb-1">
            19 <span className="text-base font-normal text-muted">EUR/mois</span>
          </p>
          <p className="text-xs text-text-light mb-6">ou 190 EUR/an (2 mois offerts)</p>
          <Link href="/register">
            <Button variant="accent" className="w-full mb-6">
              Essai gratuit de 7 jours
            </Button>
          </Link>
          <ul className="space-y-3">
            {proFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-0.5">&#10003;</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-center text-xs text-text-light mt-8">
        Tarifs adaptes automatiquement a votre region. Annulation possible a tout moment.
      </p>
    </main>
  )
}
