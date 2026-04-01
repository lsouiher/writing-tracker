# Quickstart: Francophone AI Learning Platform

**Date**: 2026-04-01

## Prerequisites

- Node.js 20 LTS
- pnpm (preferred) or npm
- Docker (for Supabase local dev)
- Supabase CLI (`npx supabase`)
- Stripe CLI (`stripe` — for webhook testing)

## 1. Project Setup

```bash
npx create-next-app@latest ialgeria --typescript --tailwind --app --src-dir --use-pnpm
cd ialgeria
```

## 2. Install Dependencies

```bash
# Core
pnpm add @supabase/supabase-js @supabase/ssr stripe @stripe/stripe-js

# AI Tutor
pnpm add @anthropic-ai/sdk

# Email
pnpm add resend @react-email/components

# Rate Limiting & Cache
pnpm add @upstash/redis @upstash/ratelimit

# Code Labs
pnpm add @monaco-editor/react

# Certificates
pnpm add @react-pdf/renderer nanoid

# Analytics
pnpm add posthog-js posthog-node

# Dev
pnpm add -D vitest @testing-library/react playwright supabase
```

## 3. Environment Variables

Create `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (one per region/plan)
STRIPE_PRICE_MONTHLY_DEFAULT=price_...
STRIPE_PRICE_MONTHLY_MAGHREB=price_...
STRIPE_PRICE_MONTHLY_CANADA=price_...
STRIPE_PRICE_ANNUAL_DEFAULT=price_...
STRIPE_PRICE_ANNUAL_MAGHREB=price_...
STRIPE_PRICE_ANNUAL_CANADA=price_...

# Bunny.net
BUNNY_STREAM_API_KEY=your-bunny-key
BUNNY_STREAM_LIBRARY_ID=your-library-id
BUNNY_SIGNING_KEY=your-signing-key

# Claude AI Tutor
ANTHROPIC_API_KEY=sk-ant-...

# Resend Email
RESEND_API_KEY=re_...

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Judge0 (Code Labs)
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your-judge0-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 4. Supabase Local Setup

```bash
npx supabase init
npx supabase start
npx supabase db reset  # Applies migrations + seed
```

## 5. Stripe Test Setup

```bash
# In a separate terminal — forward webhooks to local dev
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## 6. Run Dev Server

```bash
pnpm dev
```

Visit `http://localhost:3000`.

## 7. Run Tests

```bash
# Unit + Integration
pnpm vitest

# E2E
pnpm playwright test
```

## Key Development Patterns

### Supabase Server Client (in Route Handlers / Server Components)

```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (c) => c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } }
  )
}
```

### Tier Check Helper

```typescript
// lib/supabase/queries/subscription.ts
export async function getUserTier(supabase: SupabaseClient, userId: string): Promise<'free' | 'pro'> {
  const { data } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .single()
  return data ? 'pro' : 'free'
}
```

### Rate Limiting

```typescript
// lib/redis/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = Redis.fromEnv()

export const aiTutorLimitFree = new Ratelimit({
  redis, limiter: Ratelimit.fixedWindow(5, '24h'), prefix: 'ai:free'
})

export const aiTutorLimitPro = new Ratelimit({
  redis, limiter: Ratelimit.fixedWindow(30, '1h'), prefix: 'ai:pro'
})
```
