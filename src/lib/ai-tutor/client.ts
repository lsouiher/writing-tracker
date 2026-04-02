import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

export interface TutorStreamResult {
  stream: ReadableStream<Uint8Array>
  getUsage: () => Promise<{ inputTokens: number; outputTokens: number }>
}

export async function streamTutorResponse(
  systemPrompt: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<TutorStreamResult> {
  let inputTokens = 0
  let outputTokens = 0
  let fullResponse = ''

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6-20250514',
    max_tokens: 1024,
    temperature: 0.3,
    system: systemPrompt,
    messages,
    stream: true,
  })

  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of response) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            fullResponse += event.delta.text
            const sseData = `data: ${JSON.stringify({ type: 'text', text: event.delta.text })}\n\n`
            controller.enqueue(encoder.encode(sseData))
          }

          if (event.type === 'message_delta' && event.usage) {
            outputTokens = event.usage.output_tokens
          }

          if (event.type === 'message_start' && event.message.usage) {
            inputTokens = event.message.usage.input_tokens
          }
        }

        // Send done event with full response for client-side caching
        const doneData = `data: ${JSON.stringify({ type: 'done', fullResponse })}\n\n`
        controller.enqueue(encoder.encode(doneData))
        controller.close()
      } catch (error) {
        const errMsg = `data: ${JSON.stringify({ type: 'error', message: 'Le tuteur IA est temporairement indisponible.' })}\n\n`
        controller.enqueue(encoder.encode(errMsg))
        controller.close()
        throw error
      }
    },
  })

  return {
    stream,
    getUsage: async () => ({ inputTokens, outputTokens }),
  }
}
