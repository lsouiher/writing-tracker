import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Licences Équipe — IAlgeria',
  description: "Formez votre équipe à l'IA avec des licences groupées. 5 à 50 places, tableau de bord admin, suivi de progression.",
}

const volumePricing = [
  { seats: '5-9', pricePerSeat: '15€', savings: '21%' },
  { seats: '10-19', pricePerSeat: '13€', savings: '32%' },
  { seats: '20-49', pricePerSeat: '11€', savings: '42%' },
  { seats: '50', pricePerSeat: '9€', savings: '53%' },
]

const teamFeatures = [
  'Tout le plan Pro pour chaque membre',
  'Tableau de bord admin avec suivi de progression',
  'Invitations par email en masse',
  'Rapports de complétion exportables',
  'Support prioritaire',
  'Facturation centralisée',
]

export default function TeamsPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-16">
        <Badge variant="accent" className="mb-4">Entreprises</Badge>
        <h1 className="font-display text-4xl mb-4">
          Formez votre équipe à l&apos;IA
        </h1>
        <p className="text-muted text-lg max-w-2xl mx-auto">
          Licences groupées avec tableau de bord admin, suivi de progression par membre,
          et tarifs dégressifs selon le nombre de places.
        </p>
      </div>

      {/* Volume pricing table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden mb-12">
        <div className="bg-primary/5 px-6 py-4 border-b border-border">
          <h2 className="font-display text-xl">Tarifs par place / mois</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-muted border-b border-border">
              <th className="px-6 py-3 font-medium">Nombre de places</th>
              <th className="px-6 py-3 font-medium">Prix par place</th>
              <th className="px-6 py-3 font-medium">Économie</th>
            </tr>
          </thead>
          <tbody>
            {volumePricing.map((tier) => (
              <tr key={tier.seats} className="border-b border-border last:border-0">
                <td className="px-6 py-4 font-medium">{tier.seats} places</td>
                <td className="px-6 py-4">
                  <span className="text-lg font-semibold">{tier.pricePerSeat}</span>
                  <span className="text-muted text-sm"> /mois</span>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="success">{tier.savings}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div>
          <h3 className="font-display text-xl mb-4">Inclus pour chaque membre</h3>
          <ul className="space-y-3">
            {teamFeatures.map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-sm">
                <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-surface rounded-xl border border-border p-8 text-center flex flex-col justify-center">
          <h3 className="font-display text-2xl mb-2">Prêt à commencer ?</h3>
          <p className="text-muted text-sm mb-6">
            Choisissez le nombre de places et commencez à former votre équipe dès aujourd&apos;hui.
          </p>
          <TeamCheckoutButton />
        </div>
      </div>

      <div className="text-center text-sm text-muted">
        <p>
          Besoin de plus de 50 places ?{' '}
          <Link href="mailto:contact@ialgeria.com" className="text-primary font-medium">
            Contactez-nous
          </Link>{' '}
          pour un tarif personnalisé.
        </p>
      </div>
    </main>
  )
}

function TeamCheckoutButton() {
  return (
    <form action="/api/teams/checkout" method="POST">
      <div className="flex items-center justify-center gap-3 mb-4">
        <label htmlFor="seat_count" className="text-sm font-medium">Places :</label>
        <select
          name="seat_count"
          id="seat_count"
          defaultValue="5"
          className="px-3 py-2 rounded-lg border border-border bg-background text-sm"
        >
          {[5, 10, 15, 20, 25, 30, 40, 50].map((n) => (
            <option key={n} value={n}>{n} places</option>
          ))}
        </select>
      </div>
      <Button variant="accent" size="lg" type="submit">
        Acheter la licence
      </Button>
    </form>
  )
}
