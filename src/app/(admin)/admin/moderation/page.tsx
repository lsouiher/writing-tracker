import { requireAdmin } from '@/lib/admin/guard'
import { ModerationActions } from './moderation-actions'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Moderation',
}

export default async function AdminModerationPage() {
  const { supabase } = await requireAdmin()

  const { data: flags } = await supabase
    .from('moderation_flags')
    .select(`
      id,
      reason,
      reviewed,
      decision,
      created_at,
      reviewed_at,
      post_id,
      post:community_posts (
        id,
        title,
        body,
        author_id
      )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  const pendingFlags = (flags || []).filter((f) => !f.reviewed)
  const reviewedFlags = (flags || []).filter((f) => f.reviewed)

  return (
    <div>
      <h1 className="font-display text-3xl mb-2">Moderation</h1>
      <p className="text-muted mb-8">
        {pendingFlags.length} element{pendingFlags.length !== 1 ? 's' : ''} en attente de revision.
      </p>

      {/* Pending flags */}
      {pendingFlags.length > 0 ? (
        <div className="space-y-4 mb-10">
          {pendingFlags.map((flag) => (
            <div
              key={flag.id}
              className="bg-surface border border-border rounded-lg p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">
                    {(flag.post as { title?: string })?.title || 'Post supprime'}
                  </h3>
                  <p className="text-sm text-muted mt-1 line-clamp-2">
                    {(flag.post as { body?: string })?.body || ''}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-xs bg-error/10 text-error px-2 py-0.5 rounded-full">
                      {flag.reason}
                    </span>
                    <span className="text-xs text-muted">
                      {new Date(flag.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
                <ModerationActions flagId={flag.id} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg p-8 text-center text-muted mb-10">
          Aucun contenu a moderer.
        </div>
      )}

      {/* Reviewed flags */}
      {reviewedFlags.length > 0 && (
        <section>
          <h2 className="font-display text-xl mb-4">Historique</h2>
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-alt">
                  <th className="text-left px-4 py-3 font-medium text-muted">Post</th>
                  <th className="text-left px-4 py-3 font-medium text-muted">Raison</th>
                  <th className="text-left px-4 py-3 font-medium text-muted">Decision</th>
                  <th className="text-left px-4 py-3 font-medium text-muted">Date</th>
                </tr>
              </thead>
              <tbody>
                {reviewedFlags.map((flag) => (
                  <tr key={flag.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 truncate max-w-[200px]">
                      {(flag.post as { title?: string })?.title || 'Supprime'}
                    </td>
                    <td className="px-4 py-3 text-muted">{flag.reason}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        flag.decision === 'approved'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-error/10 text-error'
                      }`}>
                        {flag.decision === 'approved' ? 'Approuve' : 'Supprime'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {flag.reviewed_at ? new Date(flag.reviewed_at).toLocaleDateString('fr-FR') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
