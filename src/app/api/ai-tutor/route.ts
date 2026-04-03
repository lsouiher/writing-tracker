import { createClient } from '@/lib/supabase/server'
import { getServiceClient } from '@/lib/supabase/service'
import { errorResponse } from '@/lib/api/response'
import { getUserTier } from '@/lib/supabase/queries/subscriptions'
import { checkAiTutorRateLimit } from '@/lib/redis/rate-limit'
import { streamTutorResponse } from '@/lib/ai-tutor/client'
import { buildSystemPrompt, isOffTopicResponse } from '@/lib/ai-tutor/prompts'

interface AiTutorRequestBody {
  lesson_id: string
  question: string
  session_messages?: Array<{ role: 'user' | 'assistant'; content: string }>
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('UNAUTHORIZED', 'Connectez-vous pour utiliser le tuteur IA', 401)
    }

    const body = (await request.json()) as AiTutorRequestBody
    const { lesson_id: lessonId, question, session_messages: history = [] } = body

    if (!question?.trim()) {
      return errorResponse('BAD_REQUEST', 'Veuillez poser une question.', 400)
    }

    if (question.length > 2000) {
      return errorResponse('BAD_REQUEST', 'La question ne peut pas dépasser 2000 caractères.', 400)
    }

    if (!lessonId) {
      return errorResponse('BAD_REQUEST', 'Identifiant de leçon manquant.', 400)
    }

    // Check subscription tier
    const tier = await getUserTier(supabase, user.id)

    // Rate limit check
    const rateLimit = await checkAiTutorRateLimit(user.id, tier)
    if (!rateLimit.allowed) {
      const message = tier === 'free'
        ? 'Vous avez atteint la limite de 5 questions par jour. Passez à Pro pour un accès illimité.'
        : 'Limite de 30 questions par heure atteinte. Réessayez dans quelques minutes.'
      const status = tier === 'free' ? 403 : 429

      return errorResponse('RATE_LIMITED', message, status)
    }

    // Fetch lesson with module context
    const { data: lesson, error: lessonError } = await supabase
      .from('lessons')
      .select(`
        id, title, transcript,
        modules!inner (
          title, description
        )
      `)
      .eq('id', lessonId)
      .single()

    if (lessonError || !lesson) {
      return errorResponse('NOT_FOUND', 'Leçon introuvable.', 404)
    }

    const module = Array.isArray(lesson.modules) ? lesson.modules[0] : lesson.modules
    const systemPrompt = buildSystemPrompt(
      module.title,
      module.description || '',
      lesson.transcript || 'Aucune transcription disponible pour cette leçon.'
    )

    // Build messages: last 3 history pairs + current question
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...history.slice(-6), // Last 3 exchanges (6 messages)
      { role: 'user' as const, content: question },
    ]

    // Stream response from Claude
    const { stream, getUsage } = await streamTutorResponse(systemPrompt, messages)

    // Collect full response for logging (tee the stream)
    let fullResponse = ''
    const [logStream, clientStream] = stream.tee()

    // Log in background after stream completes
    const logReader = logStream.getReader()
    const decoder = new TextDecoder()
    ;(async () => {
      try {
        while (true) {
          const { done, value } = await logReader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          // Parse SSE data to extract text
          const lines = chunk.split('\n')
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const parsed = JSON.parse(line.slice(6))
                if (parsed.type === 'done') {
                  fullResponse = parsed.fullResponse
                }
              } catch {
                // Skip malformed chunks
              }
            }
          }
        }

        // Log to database
        const usage = await getUsage()
        const wasOffTopic = isOffTopicResponse(fullResponse)

        const serviceClient = getServiceClient()
        await serviceClient.from('ai_tutor_logs').insert({
          user_id: user.id,
          lesson_id: lessonId,
          question,
          answer: fullResponse,
          was_off_topic: wasOffTopic,
          tokens_used: usage.inputTokens + usage.outputTokens,
        })
      } catch {
        // Logging failure should not affect the user
      }
    })()

    // Return SSE stream with rate limit headers
    return new Response(clientStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-RateLimit-Limit': String(rateLimit.limit),
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-RateLimit-Reset': String(rateLimit.reset),
      },
    })
  } catch {
    return errorResponse(
      'INTERNAL_ERROR',
      'Le tuteur IA est temporairement indisponible. Réessayez dans quelques instants.',
      500
    )
  }
}
