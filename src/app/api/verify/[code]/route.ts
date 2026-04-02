import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import { getCertificateByCode } from '@/lib/supabase/queries/certificates'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params
    const supabase = await createClient()
    const certificate = await getCertificateByCode(supabase, code)

    if (!certificate) {
      return errorResponse('NOT_FOUND', 'Certificat introuvable', 404)
    }

    return successResponse({
      holder_name: certificate.user.full_name,
      course_title: certificate.course.title,
      issued_at: certificate.issued_at,
      valid: true,
    })
  } catch {
    return errorResponse('INTERNAL_ERROR', 'Impossible de vérifier le certificat', 500)
  }
}
