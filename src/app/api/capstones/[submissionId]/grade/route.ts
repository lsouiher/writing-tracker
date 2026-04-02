import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import { getUserTier } from '@/lib/supabase/queries/subscriptions'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    const { submissionId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('UNAUTHORIZED', 'Connectez-vous', 401)
    }

    const tier = await getUserTier(supabase, user.id)
    if (tier !== 'pro') {
      return errorResponse('FORBIDDEN', 'Réservé aux abonnés Pro', 403)
    }

    // Fetch submission
    const { data: submission } = await supabase
      .from('capstone_submissions')
      .select('*, course:courses!inner(title, description)')
      .eq('id', submissionId)
      .eq('user_id', user.id)
      .single()

    if (!submission) {
      return errorResponse('NOT_FOUND', 'Soumission introuvable', 404)
    }

    if (submission.status !== 'submitted') {
      return errorResponse('BAD_REQUEST', 'Ce projet a déjà été évalué', 400)
    }

    // Mark as grading
    await supabase
      .from('capstone_submissions')
      .update({ status: 'grading' })
      .eq('id', submissionId)

    // AI grading via Claude
    const prompt = `Tu es un évaluateur de projets capstone pour le cours "${submission.course.title}".

Description du cours : ${submission.course.description}

Projet soumis par l'étudiant :
- Titre : ${submission.title}
- Description : ${submission.description}
${submission.repository_url ? `- Dépôt : ${submission.repository_url}` : ''}
${submission.submitted_code ? `- Code soumis :\n\`\`\`\n${submission.submitted_code}\n\`\`\`` : ''}

Évalue ce projet sur 100 points selon les critères suivants :
1. Pertinence par rapport au cours (25 pts)
2. Qualité technique et implémentation (25 pts)
3. Documentation et clarté (25 pts)
4. Originalité et effort (25 pts)

Réponds en JSON uniquement avec ce format :
{"score": <nombre 0-100>, "feedback": "<feedback détaillé en français, 2-3 paragraphes>"}`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : ''
    let score = 0
    let feedback = ''

    try {
      const parsed = JSON.parse(responseText)
      score = Math.min(100, Math.max(0, parsed.score))
      feedback = parsed.feedback
    } catch {
      // Fallback if JSON parsing fails
      score = 50
      feedback = responseText
    }

    const passed = score >= 70
    const status = passed ? 'approved' : 'graded'

    // Update submission with results
    await supabase
      .from('capstone_submissions')
      .update({
        ai_score: score,
        ai_feedback: feedback,
        status,
        peer_review_open: passed,
        graded_at: new Date().toISOString(),
      })
      .eq('id', submissionId)

    return successResponse({
      score,
      status,
      feedback,
      passed,
    })
  } catch {
    return errorResponse('INTERNAL_ERROR', "Impossible d'évaluer le projet", 500)
  }
}
