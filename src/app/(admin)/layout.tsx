import { requireAdmin } from '@/lib/admin/guard'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | Admin IAlgeria',
    default: 'Admin IAlgeria',
  },
}

const navItems = [
  { href: '/admin', label: 'Tableau de bord' },
  { href: '/admin/content', label: 'Contenu' },
  { href: '/admin/users', label: 'Utilisateurs' },
  { href: '/admin/moderation', label: 'Moderation' },
  { href: '/admin/coupons', label: 'Coupons' },
  { href: '/admin/ai-logs', label: 'Logs IA' },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-[280px] bg-surface border-r border-border p-6 flex flex-col shrink-0">
        <Link href="/admin" className="font-display text-2xl text-primary mb-1">
          IAlgeria
        </Link>
        <span className="text-xs text-muted mb-8">Administration</span>

        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-3 py-2 text-sm rounded-lg hover:bg-surface-alt transition-colors text-text"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/dashboard"
          className="text-xs text-muted hover:text-text transition-colors"
        >
          Retour a la plateforme
        </Link>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 bg-background overflow-auto">
        {children}
      </main>
    </div>
  )
}
