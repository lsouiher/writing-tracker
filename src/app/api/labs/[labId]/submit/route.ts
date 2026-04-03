import { createClient } from '@/lib/supabase/server'
import { successResponse, errorResponse } from '@/lib/api/response'
import { getUserTier } from '@/lib/supabase/queries/subscriptions'
import { saveLabSubmission } from '@/lib/supabase/queries/labs'
import { checkApiRateLimit } from '@/lib/redis/api-rate-limit'
import { NextRequest } from 'next/server'

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com'
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || ''

const LANGUAGE_IDS: Record<string, number> = {
  python: 71,
  javascript: 63,
  r: 80,
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ labId: string }> }
) {
  try {
    const rateLimited = await checkApiRateLimit(request, 'mutation')
    if (rateLimited) return rateLimited

    const { labId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return errorResponse('UNAUTHORIZED', 'Connectez-vous pour soumettre un exercice', 401)
    }

    const tier = await getUserTier(supabase, user.id)
    if (tier !== 'pro') {
      return errorResponse('FORBIDDEN', 'Les exercices de code sont réservés aux abonnés Pro', 403)
    }

    const body = await request.json()
    const { code, language } = body

    if (!code || !language) {
      return errorResponse('BAD_REQUEST', 'Le code et le langage sont requis', 400)
    }

    if (code.length > 65536) {
      return errorResponse('BAD_REQUEST', 'Le code ne peut pas dépasser 64 Ko', 400)
    }

    // Fetch the lab for test cases
    const { data: lab } = await supabase
      .from('labs')
      .select('*')
      .eq('id', labId)
      .single()

    if (!lab) {
      return errorResponse('NOT_FOUND', 'Exercice introuvable', 404)
    }

    const testCases = lab.test_cases as { input: string; expected_output: string }[]
    const languageId = LANGUAGE_IDS[language]

    if (!languageId) {
      return errorResponse('BAD_REQUEST', 'Langage non supporté', 400)
    }

    // Run code against each test case via Judge0
    const testResults = []
    let allPassed = true

    for (const testCase of testCases) {
      const result = await executeCode(code, languageId, testCase.input)
      const actual = result.stdout?.trim() ?? ''
      const passed = actual === testCase.expected_output.trim()
      if (!passed) allPassed = false
      testResults.push({
        input: testCase.input,
        expected: testCase.expected_output,
        actual,
        passed,
      })
    }

    const output = testResults
      .map((r) => `${r.passed ? '✓' : '✗'} Input: ${r.input} → ${r.actual}`)
      .join('\n')

    // Save submission
    await saveLabSubmission(supabase, user.id, labId, code, {
      passed: allPassed,
      output,
    })

    return successResponse({ passed: allPassed, output, test_results: testResults })
  } catch {
    return errorResponse('INTERNAL_ERROR', "Impossible d'exécuter le code", 500)
  }
}

async function executeCode(
  sourceCode: string,
  languageId: number,
  stdin: string
): Promise<{ stdout: string | null; stderr: string | null; status: { id: number } }> {
  const response = await fetch(`${JUDGE0_API_URL}/submissions?base64_encoded=false&wait=true`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': JUDGE0_API_KEY,
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
    },
    body: JSON.stringify({
      source_code: sourceCode,
      language_id: languageId,
      stdin,
      cpu_time_limit: 10,
      memory_limit: 262144, // 256MB
    }),
  })

  return response.json()
}
