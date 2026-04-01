# AI Tutor Contract

**Date**: 2026-04-01

## Interface

**Endpoint**: `POST /api/ai-tutor`  
**Auth**: Required (Free: 5 questions/day, Pro: 30 questions/hour)  
**Transport**: Server-Sent Events (streaming)

## System Prompt

```text
Tu es un tuteur IA spécialisé dans l'enseignement de l'intelligence artificielle et de la science des données. Tu fais partie de la plateforme IAlgeria.

RÈGLES STRICTES:
1. Réponds UNIQUEMENT en français.
2. Base tes réponses EXCLUSIVEMENT sur le contenu de la leçon fournie ci-dessous et le contexte du module.
3. Si la question n'est PAS liée au contenu du cours, réponds poliment:
   "Cette question sort du cadre de cette leçon. Je vous suggère de consulter [suggestion de leçon pertinente] ou de poser votre question dans le forum communautaire."
4. Utilise des exemples concrets et du code quand c'est pertinent.
5. Adapte ton niveau d'explication au niveau du cours (débutant/intermédiaire/avancé).
6. Ne génère JAMAIS de contenu qui n'est pas dans le programme du cours.
7. Si l'étudiant semble bloqué, guide-le avec des indices progressifs plutôt que de donner la réponse directement.

CONTEXTE DU MODULE:
{module_title} — {module_description}

TRANSCRIPTION DE LA LEÇON:
{lesson_transcript}
```

## Request Flow

```
Client → POST /api/ai-tutor
  ├── Verify auth (Supabase session)
  ├── Check rate limit (Upstash Redis)
  │   ├── Free: INCR ai:{userId}:daily (TTL 24h) — reject if > 5
  │   └── Pro: INCR ai:{userId}:hourly (TTL 1h) — reject if > 30
  ├── Fetch lesson transcript + module context (Supabase)
  ├── Build messages array:
  │   ├── System prompt (with transcript injected)
  │   ├── Last 3 session messages (from request body)
  │   └── Current question
  ├── Call Claude API (streaming)
  │   ├── Model: claude-sonnet-4-6
  │   ├── Max tokens: 1024
  │   └── Temperature: 0.3
  ├── Stream response chunks via SSE
  ├── On completion:
  │   ├── Detect off-topic (check if response contains decline phrase)
  │   ├── Log to ai_tutor_logs table
  │   └── Send final SSE with metadata
  └── Return
```

## Rate Limit Headers

```
X-RateLimit-Limit: 5 (or 30 for Pro)
X-RateLimit-Remaining: 3
X-RateLimit-Reset: 1714500000 (Unix timestamp)
```

## Error Responses

| Code | Condition | Message |
|------|-----------|---------|
| 401 | Not authenticated | "Connectez-vous pour utiliser le tuteur IA" |
| 403 | Free user, daily limit reached | "Vous avez atteint la limite de 5 questions par jour. Passez à Pro pour un accès illimité." |
| 429 | Pro user, hourly burst limit | "Limite de 30 questions par heure atteinte. Réessayez dans quelques minutes." |
| 400 | Empty question | "Veuillez poser une question." |
| 500 | Claude API error | "Le tuteur IA est temporairement indisponible. Réessayez dans quelques instants." |

## Cost Tracking

- Average tokens per question: ~800 (input: ~600 transcript + prompt, output: ~200 answer)
- Estimated cost: ~$0.003/question (Claude Sonnet pricing)
- Monthly budget alert: PostHog event when `ai_tutor_logs` cost exceeds $50/month
- Tracked in `ai_tutor_logs.tokens_used` for per-question granularity
