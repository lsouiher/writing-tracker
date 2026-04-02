import { requireAdmin } from '@/lib/admin/guard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tableau de bord',
}

export default async function AdminDashboardPage() {
  const { supabase } = await requireAdmin()

  // Run all stat queries in parallel
  const [usersResult, proResult, moderationResult, coursesResult] = await Promise.all([
    supabase.from('users').select('id', { count: 'exact', head: true }).is('deleted_at', null),
    supabase.from('subscriptions').select('id', { count: 'exact', head: true }).in('status', ['active', 'trialing']),
    supabase.from('moderation_flags').select('id', { count: 'exact', head: true }).eq('reviewed', false),
    supabase.from('courses').select('id', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Utilisateurs', value: usersResult.count || 0 },
    { label: 'Abonnes Pro', value: proResult.count || 0 },
    { label: 'Cours', value: coursesResult.count || 0 },
    { label: 'Flags en attente', value: moderationResult.count || 0 },
  ]

  // Recent signups
  const { data: recentUsers } = await supabase
    .from('users')
    .select('id, full_name, email, role, created_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div>
      <h1 className="font-display text-3xl mb-2">Tableau de bord</h1>
      <p className="text-muted mb-8">Vue d&apos;ensemble de la plateforme.</p>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-surface border border-border rounded-lg p-6"
          >
            <div className="text-3xl font-display text-primary mb-1">{stat.value}</div>
            <div className="text-sm text-muted">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent users */}
      <section>
        <h2 className="font-display text-xl mb-4">Inscriptions recentes</h2>
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-alt">
                <th className="text-left px-4 py-3 font-medium text-muted">Nom</th>
                <th className="text-left px-4 py-3 font-medium text-muted">Email</th>
                <th className="text-left px-4 py-3 font-medium text-muted">Role</th>
                <th className="text-left px-4 py-3 font-medium text-muted">Date</th>
              </tr>
            </thead>
            <tbody>
              {(recentUsers || []).map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{u.full_name}</td>
                  <td className="px-4 py-3 text-muted">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      u.role === 'admin' ? 'bg-accent/10 text-accent'
                      : u.role === 'team_admin' ? 'bg-info/10 text-info'
                      : 'bg-surface-alt text-muted'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(u.created_at).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
