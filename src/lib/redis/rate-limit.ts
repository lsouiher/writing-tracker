import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Free users: 5 questions per day
const freeLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(5, '1 d'),
  prefix: 'ai:free',
})

// Pro users: 30 questions per hour
const proLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(30, '1 h'),
  prefix: 'ai:pro',
})

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  reset: number // Unix timestamp
}

export async function checkAiTutorRateLimit(
  userId: string,
  tier: 'free' | 'pro'
): Promise<RateLimitResult> {
  const limiter = tier === 'pro' ? proLimiter : freeLimiter
  const { success, limit, remaining, reset } = await limiter.limit(userId)

  return {
    allowed: success,
    limit,
    remaining,
    reset: Math.floor(reset / 1000), // Convert to Unix seconds
  }
}
