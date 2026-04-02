import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import { getTeamLicenseByAdmin, inviteTeamMember } from '@/lib/supabase/queries/teams'
import { sendEmail } from '@/lib/email/send'
import { renderTeamInvite } from '@/lib/email/templates/team-invite'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('UNAUTHORIZED', 'Connectez-vous pour continuer', 401)
    }

    const body = await request.json()
    const emails: string[] = body.emails

    if (!Array.isArray(emails) || emails.length === 0) {
      return errorResponse('VALIDATION_ERROR', 'Fournissez au moins une adresse email', 400)
    }

    const license = await getTeamLicenseByAdmin(supabase, user.id)

    if (!license) {
      return errorResponse('FORBIDDEN', "Vous n'avez pas de licence équipe active", 403)
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    let invited = 0
    const errors: string[] = []

    for (const email of emails) {
      try {
        await inviteTeamMember(supabase, license.id, email)

        const html = renderTeamInvite({
          teamName: user.user_metadata?.full_name ? `Équipe de ${user.user_metadata.full_name}` : 'IAlgeria Team',
          inviterName: user.user_metadata?.full_name || user.email || 'Un administrateur',
          acceptUrl: `${siteUrl}/teams/accept?license=${license.id}&email=${encodeURIComponent(email)}`,
          siteUrl,
        })

        await sendEmail({
          to: email,
          subject: 'Invitation à rejoindre une équipe sur IAlgeria',
          html,
        })

        invited++
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Erreur inconnue'
        errors.push(`${email}: ${msg}`)
      }
    }

    return successResponse({ invited, errors })
  } catch {
    return errorResponse('INTERNAL_ERROR', "Impossible d'envoyer les invitations", 500)
  }
}
