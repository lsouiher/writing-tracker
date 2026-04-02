import Link from 'next/link'
import { Button } from '@/components/ui/button'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IAlgeria — Apprenez l\'IA en francais',
  description: 'La premiere plateforme d\'apprentissage de l\'intelligence artificielle en francais. Cours video gratuits, laboratoires interactifs, tuteur IA personnel.',
}

export default function LandingPage() {
  return (
    <main>
      {/* Navigation */}
      <nav className="bg-surface border-b border-border px-4 sm:px-6 lg:px-12 py-4 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl text-primary">
          IAlgeria
        </Link>
        <div className="hidden sm:flex items-center gap-8">
          <Link href="/courses" className="text-sm text-muted hover:text-foreground">
            Cours
          </Link>
          <Link href="/pricing" className="text-sm text-muted hover:text-foreground">
            Tarifs
          </Link>
          <Link href="/login">
            <Button size="sm">Commencer gratuitement</Button>
          </Link>
        </div>
        <div className="flex sm:hidden items-center gap-3">
          <Link href="/courses" className="text-sm text-muted hover:text-foreground">
            Cours
          </Link>
          <Link href="/login">
            <Button size="sm">Commencer</Button>
          </Link>
        </div>
      </nav>

      {/* Zellige accent */}
      <div className="w-full h-1 bg-[repeating-linear-gradient(90deg,var(--primary)_0px,var(--primary)_8px,transparent_8px,transparent_12px,var(--accent)_12px,var(--accent)_20px,transparent_20px,transparent_24px)] opacity-60" />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 lg:py-28 grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        <div>
          <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl leading-tight mb-6">
            Apprenez l&apos;IA{' '}
            <em className="text-primary">en francais</em>
          </h1>
          <p className="text-lg text-muted mb-8 max-w-lg">
            La premiere plateforme d&apos;apprentissage de l&apos;intelligence
            artificielle concue pour les professionnels francophones. Cours
            video gratuits, laboratoires interactifs, tuteur IA personnel.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link href="/courses">
              <Button variant="accent" size="lg" className="w-full sm:w-auto">
                Commencer gratuitement
              </Button>
            </Link>
            <Link href="/courses">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                Voir les cours
              </Button>
            </Link>
          </div>
          <div className="flex gap-8 sm:gap-12 mt-8 sm:mt-12">
            <div>
              <p className="font-display text-3xl text-primary">12</p>
              <p className="text-xs text-muted">Cours structures</p>
            </div>
            <div>
              <p className="font-display text-3xl text-primary">50+</p>
              <p className="text-xs text-muted">Heures de video</p>
            </div>
            <div>
              <p className="font-display text-3xl text-primary">100%</p>
              <p className="text-xs text-muted">En francais</p>
            </div>
          </div>
        </div>

        {/* AI Tutor preview card */}
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="bg-primary text-white px-4 py-3 text-sm font-medium">
            Tuteur IA
          </div>
          <div className="p-4 space-y-3">
            <div className="text-right">
              <span className="inline-block bg-primary text-white px-3 py-2 rounded-lg text-sm max-w-xs text-left">
                Quelle est la difference entre regression lineaire et logistique?
              </span>
            </div>
            <div>
              <span className="inline-block bg-surface-alt px-3 py-2 rounded-lg text-sm max-w-xs">
                La regression lineaire predit une valeur continue (ex: prix
                d&apos;une maison), tandis que la regression logistique predit
                une probabilite de classe (ex: spam ou non)...
              </span>
            </div>
          </div>
          <div className="px-4 py-3 border-t border-border">
            <div className="bg-background rounded-full px-4 py-2 text-sm text-text-light">
              Posez votre question...
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="bg-surface-alt py-16">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-2 text-center">
            Pourquoi IAlgeria
          </p>
          <h2 className="font-display text-3xl text-center mb-12">
            Tout ce dont vous avez besoin pour maitriser l&apos;IA
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Videos gratuites',
                desc: 'Tous les cours video sont accessibles gratuitement, sans limite de temps.',
              },
              {
                title: 'Tuteur IA personnel',
                desc: 'Posez vos questions en francais et recevez des reponses contextuelles instantanees.',
              },
              {
                title: 'Certificats verifiables',
                desc: 'Obtenez des certificats de completion partageables sur LinkedIn.',
              },
            ].map((item) => (
              <div key={item.title} className="bg-surface p-6 rounded-xl border border-border">
                <h3 className="font-display text-xl mb-2">{item.title}</h3>
                <p className="text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-text-light">
        IAlgeria &copy; {new Date().getFullYear()}. Tous droits reserves.
      </footer>
    </main>
  )
}
