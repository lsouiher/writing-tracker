import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import { generateSignedVideoUrl } from '@/lib/bunny/signed-urls'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = await createClient()

    // Get lesson details
    const { data: lesson, error } = await supabase
      .from('lessons')
      .select('*, modules!inner(course_id)')
      .eq('slug', slug)
      .single()

    if (error || !lesson) {
      return errorResponse('NOT_FOUND', 'Lecon introuvable', 404)
    }

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()

    // Free preview check: non-preview lessons require auth
    if (!lesson.is_free_preview && !user) {
      return errorResponse('UNAUTHORIZED', 'Connectez-vous pour acceder a cette lecon', 401)
    }

    // Generate signed video URL
    let videoUrl: string
    try {
      videoUrl = generateSignedVideoUrl(lesson.video_id)
    } catch {
      return errorResponse('VIDEO_ERROR', 'Impossible de charger la video', 500)
    }

    // Get resume position if authenticated
    let resumePosition = 0
    if (user) {
      const { data: progress } = await supabase
        .from('progress')
        .select('last_position_seconds')
        .eq('user_id', user.id)
        .eq('lesson_id', lesson.id)
        .single()

      resumePosition = progress?.last_position_seconds ?? 0
    }

    return successResponse({
      video_url: videoUrl,
      subtitle_url_fr: lesson.subtitle_url_fr,
      subtitle_url_en: lesson.subtitle_url_en,
      transcript_fr: lesson.transcript_fr,
      resume_position_seconds: resumePosition,
    })
  } catch {
    return errorResponse('INTERNAL_ERROR', 'Erreur lors du chargement de la video', 500)
  }
}
