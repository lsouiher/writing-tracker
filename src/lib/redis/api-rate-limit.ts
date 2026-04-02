import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// General API: 60 requests per minute per IP
const apiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '1 m'),
  prefix: 'api:general',
})

// Stricter limit for mutation endpoints: 20 per minute per IP
const mutationLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 m'),
  prefix: 'api:mutation',
})

// Auth endpoints: 10 per minute per IP to prevent brute force
const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'),
  prefix: 'api:auth',
})

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

function rateLimitHeaders(limit: number, remaining: number, reset: number) {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': Math.floor(reset / 1000).toString(),
  }
}

export type RateLimitTier = 'general' | 'mutation' | 'auth'

export async function checkApiRateLimit(
  request: NextRequest,
  tier: RateLimitTier = 'general'
): Promise<NextResponse | null> {
  const ip = getClientIp(request)

  const limiter =
    tier === 'auth'
      ? authLimiter
      : tier === 'mutation'
        ? mutationLimiter
        : apiLimiter

  const { success, limit, remaining, reset } = await limiter.limit(ip)

  if (!success) {
    return NextResponse.json(
      { data: null, error: { code: 'RATE_LIMITED', message: 'Trop de requêtes. Veuillez réessayer plus tard.' } },
      { status: 429, headers: rateLimitHeaders(limit, remaining, reset) }
    )
  }

  return null // Not rate limited — continue
}
