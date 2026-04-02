import { requireAdmin } from '@/lib/admin/guard'
import { CreateCouponForm } from './create-coupon-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Coupons',
}

export default async function AdminCouponsPage() {
  const { supabase } = await requireAdmin()

  const { data: coupons } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <h1 className="font-display text-3xl mb-2">Coupons</h1>
      <p className="text-muted mb-8">Gerez les codes de reduction.</p>

      {/* Create form */}
      <CreateCouponForm />

      {/* Existing coupons */}
      <section className="mt-8">
        <h2 className="font-display text-xl mb-4">Coupons existants</h2>
        {(coupons || []).length > 0 ? (
          <div className="bg-surface border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-alt">
                  <th className="text-left px-4 py-3 font-medium text-muted">Code</th>
                  <th className="text-left px-4 py-3 font-medium text-muted">Remise</th>
                  <th className="text-left px-4 py-3 font-medium text-muted">Utilisations</th>
                  <th className="text-left px-4 py-3 font-medium text-muted">Expiration</th>
                  <th className="text-left px-4 py-3 font-medium text-muted">Cree le</th>
                </tr>
              </thead>
              <tbody>
                {(coupons || []).map((coupon) => (
                  <tr key={coupon.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-mono font-medium">{coupon.code}</td>
                    <td className="px-4 py-3">{coupon.discount_percent}%</td>
                    <td className="px-4 py-3">
                      {coupon.current_uses} / {coupon.max_uses}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {coupon.expires_at
                        ? new Date(coupon.expires_at).toLocaleDateString('fr-FR')
                        : 'Jamais'}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {new Date(coupon.created_at).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-lg p-8 text-center text-muted">
            Aucun coupon cree.
          </div>
        )}
      </section>
    </div>
  )
}
