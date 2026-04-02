import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import { getUserTier } from '@/lib/supabase/queries/subscriptions'
import { checkCertificateEligibility, createCertificate } from '@/lib/supabase/queries/certificates'
import { generateCertificatePdf } from '@/lib/certificates/generate'
import { nanoid } from 'nanoid'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('UNAUTHORIZED', 'Connectez-vous pour générer un certificat', 401)
    }

    const tier = await getUserTier(supabase, user.id)
    if (tier !== 'pro') {
      return errorResponse('FORBIDDEN', 'Les certificats sont réservés aux abonnés Pro', 403)
    }

    const body = await request.json()
    const { course_id } = body

    if (!course_id) {
      return errorResponse('BAD_REQUEST', 'course_id est requis', 400)
    }

    // Check eligibility
    const eligibility = await checkCertificateEligibility(supabase, user.id, course_id)
    if (!eligibility.eligible) {
      return errorResponse('FORBIDDEN', eligibility.reason!, 403)
    }

    // Fetch user and course info for the PDF
    const { data: userProfile } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', user.id)
      .single()

    const { data: course } = await supabase
      .from('courses')
      .select('title')
      .eq('id', course_id)
      .single()

    if (!userProfile || !course) {
      return errorResponse('INTERNAL_ERROR', 'Impossible de charger les données', 500)
    }

    const verificationCode = nanoid(16)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ialgeria.com'

    // Generate PDF
    const pdfBuffer = await generateCertificatePdf({
      holderName: userProfile.full_name,
      courseTitle: course.title,
      issuedAt: new Date(),
      verificationCode,
      siteUrl,
    })

    // Upload to Supabase Storage
    const filePath = `certificates/${user.id}/${verificationCode}.pdf`
    const { error: uploadError } = await supabase.storage
      .from('certificates')
      .upload(filePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false,
      })

    if (uploadError) throw uploadError

    const { data: urlData } = supabase.storage
      .from('certificates')
      .getPublicUrl(filePath)

    // Create DB record
    const certificate = await createCertificate(
      supabase,
      user.id,
      course_id,
      verificationCode,
      urlData.publicUrl
    )

    return successResponse({
      certificate_id: certificate.id,
      verification_code: verificationCode,
      pdf_url: urlData.publicUrl,
    }, 201)
  } catch {
    return errorResponse('INTERNAL_ERROR', 'Impossible de générer le certificat', 500)
  }
}
