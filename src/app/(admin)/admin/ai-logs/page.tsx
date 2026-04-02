import { requireAdmin } from '@/lib/admin/guard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Logs IA',
}

export default async function AdminAiLogsPage() {
  const { supabase } = await requireAdmin()

  // ai_tutor_logs table will be created in Phase 10
  // Try to query it — if it doesn't exist yet, show placeholder
  const { data: logs, error } = await supabase
    .from('ai_tutor_logs')
    .select(`
      id,
      user_id,
      lesson_id,
      question,
      response,
      off_topic,
      tokens_used,
      created_at
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    return (
      <div>
        <h1 className="font-display text-3xl mb-2">Logs IA</h1>
        <p className="text-muted mb-8">Historique des interactions avec le tuteur IA.</p>
        <div className="bg-surface border border-border rounded-lg p-8 text-center text-muted">
          Le tuteur IA n&apos;est pas encore configure. Les logs apparaitront ici apres l&apos;activation du tuteur (Phase 10).
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-display text-3xl mb-2">Logs IA</h1>
      <p className="text-muted mb-8">
        {(logs || []).length} interaction{(logs || []).length !== 1 ? 's' : ''} recente{(logs || []).length !== 1 ? 's' : ''}.
      </p>

      {(logs || []).length > 0 ? (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-alt">
                <th className="text-left px-4 py-3 font-medium text-muted">Question</th>
                <th className="text-left px-4 py-3 font-medium text-muted">Hors-sujet</th>
                <th className="text-left px-4 py-3 font-medium text-muted">Tokens</th>
                <th className="text-left px-4 py-3 font-medium text-muted">Date</th>
              </tr>
            </thead>
            <tbody>
              {(logs || []).map((log: Record<string, unknown>) => (
                <tr key={log.id as string} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 max-w-[400px] truncate">
                    {log.question as string}
                  </td>
                  <td className="px-4 py-3">
                    {log.off_topic ? (
                      <span className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded-full">Oui</span>
                    ) : (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Non</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted tabular-nums">{log.tokens_used as number}</td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(log.created_at as string).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg p-8 text-center text-muted">
          Aucune interaction enregistree.
        </div>
      )}
    </div>
  )
}
