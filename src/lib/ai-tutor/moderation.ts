import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

interface ModerationResult {
  flagged: boolean
  reason: string | null
}

export async function moderateContent(content: string): Promise<ModerationResult> {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: `Tu es un modérateur de contenu pour une plateforme éducative francophone. Analyse le texte suivant et détermine s'il contient du contenu inapproprié (spam, harcèlement, discours haineux, contenu sexuel, violence, publicité non sollicitée, ou hors-sujet par rapport à l'apprentissage).

Texte à analyser :
"""
${content}
"""

Réponds en JSON uniquement :
{"flagged": true/false, "reason": "raison en français ou null si pas flaggé"}`,
        },
      ],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '{}'

    try {
      const result = JSON.parse(responseText)
      return {
        flagged: !!result.flagged,
        reason: result.reason || null,
      }
    } catch {
      return { flagged: false, reason: null }
    }
  } catch {
    // If moderation fails, don't block the post — log and allow
    return { flagged: false, reason: null }
  }
}
