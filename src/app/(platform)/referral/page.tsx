import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getReferralStats } from '@/lib/supabase/queries/referrals'
import { ReferralLinkCopy } from './referral-link-copy'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Parrainage',
}

export default async function ReferralPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirect=/referral')

  const { data: profile } = await supabase
    .from('users')
    .select('referral_code')
    .eq('id', user.id)
    .single()

  const stats = await getReferralStats(supabase, user.id)
  const referralCode = profile?.referral_code || ''

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="font-display text-3xl mb-2">Parrainage</h1>
      <p className="text-muted mb-8">
        Invitez vos amis et recevez chacun un mois Pro gratuit.
      </p>

      {/* How it works */}
      <section className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-8">
        <h2 className="font-display text-xl mb-4">Comment ca marche</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          <div>
            <div className="text-2xl font-display text-primary mb-2">1</div>
            <p className="text-sm text-muted">
              Partagez votre lien unique avec un ami.
            </p>
          </div>
          <div>
            <div className="text-2xl font-display text-primary mb-2">2</div>
            <p className="text-sm text-muted">
              Votre ami s&apos;inscrit et passe a Pro.
            </p>
          </div>
          <div>
            <div className="text-2xl font-display text-primary mb-2">3</div>
            <p className="text-sm text-muted">
              Vous recevez tous les deux un mois gratuit.
            </p>
          </div>
        </div>
      </section>

      {/* Referral link */}
      <section className="bg-surface border border-border rounded-lg p-6 mb-8">
        <h2 className="font-display text-xl mb-4">Votre lien de parrainage</h2>
        <ReferralLinkCopy referralCode={referralCode} />
      </section>

      {/* Stats */}
      <section className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-surface border border-border rounded-lg p-6 text-center">
          <div className="text-3xl font-display text-primary mb-1">{stats.total}</div>
          <div className="text-sm text-muted">Invitations envoyees</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-6 text-center">
          <div className="text-3xl font-display text-primary mb-1">{stats.completed}</div>
          <div className="text-sm text-muted">Parrainages completes</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-6 text-center">
          <div className="text-3xl font-display text-primary mb-1">{stats.rewards_applied}</div>
          <div className="text-sm text-muted">Mois gratuits gagnes</div>
        </div>
      </section>

      {/* Referral history */}
      {stats.referrals.length > 0 && (
        <section className="bg-surface border border-border rounded-lg p-6">
          <h2 className="font-display text-xl mb-4">Historique</h2>
          <div className="space-y-3">
            {stats.referrals.map((referral) => (
              <div
                key={referral.id}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div className="text-sm text-muted">
                  {new Date(referral.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full ${
                    referral.status === 'completed'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-surface-alt text-muted'
                  }`}
                >
                  {referral.status === 'completed' ? 'Complete' : 'En attente'}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
