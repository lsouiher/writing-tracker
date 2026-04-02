import { requireAdmin } from '@/lib/admin/guard'
import { UserSearch } from './user-search'
import { UserRoleEditor } from './user-role-editor'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Utilisateurs',
}

interface Props {
  searchParams: Promise<{ search?: string; role?: string; page?: string }>
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const { supabase } = await requireAdmin()
  const params = await searchParams
  const search = params.search || ''
  const roleFilter = params.role || ''
  const page = parseInt(params.page || '1', 10)
  const limit = 50
  const offset = (page - 1) * limit

  let query = supabase
    .from('users')
    .select('id, email, full_name, country, role, created_at, deleted_at', { count: 'exact' })

  if (roleFilter) query = query.eq('role', roleFilter)
  if (search) query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)

  const { data: users, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  const totalPages = Math.ceil((count || 0) / limit)

  return (
    <div>
      <h1 className="font-display text-3xl mb-2">Utilisateurs</h1>
      <p className="text-muted mb-8">{count || 0} utilisateur{(count || 0) !== 1 ? 's' : ''} au total.</p>

      {/* Search + filter */}
      <UserSearch currentSearch={search} currentRole={roleFilter} />

      {/* Users table */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden mt-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-alt">
              <th className="text-left px-4 py-3 font-medium text-muted">Nom</th>
              <th className="text-left px-4 py-3 font-medium text-muted">Email</th>
              <th className="text-left px-4 py-3 font-medium text-muted">Pays</th>
              <th className="text-left px-4 py-3 font-medium text-muted">Role</th>
              <th className="text-left px-4 py-3 font-medium text-muted">Inscription</th>
            </tr>
          </thead>
          <tbody>
            {(users || []).map((user) => (
              <tr key={user.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  {user.full_name}
                  {user.deleted_at && (
                    <span className="text-xs text-error ml-2">(supprime)</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted">{user.email}</td>
                <td className="px-4 py-3 text-muted">{user.country || '-'}</td>
                <td className="px-4 py-3">
                  <UserRoleEditor userId={user.id} currentRole={user.role} />
                </td>
                <td className="px-4 py-3 text-muted tabular-nums">
                  {new Date(user.created_at).toLocaleDateString('fr-FR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/admin/users?page=${p}${search ? `&search=${search}` : ''}${roleFilter ? `&role=${roleFilter}` : ''}`}
              className={`px-3 py-1.5 text-sm rounded-lg ${
                p === page
                  ? 'bg-primary text-white'
                  : 'bg-surface border border-border hover:bg-surface-alt'
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
