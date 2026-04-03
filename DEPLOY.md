# IAlgeria Deployment Guide

## Overview

IAlgeria is a Next.js 16 app deployed on **Vercel**, backed by **Supabase** (Postgres + Auth), **Stripe** (payments), **Upstash Redis** (rate limiting), **Resend** (email), **Bunny.net** (video CDN), **Judge0** (code execution), and the **Claude API** (AI tutor + grading + moderation).

## 1. Supabase Setup

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard)
2. Go to **Project Settings > API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` secret key → `SUPABASE_SERVICE_ROLE_KEY`
3. Run all migrations in order. Open the **SQL Editor** in the Supabase dashboard and paste each file one by one:

```
src/supabase/migrations/001_users.sql
src/supabase/migrations/002_content.sql
src/supabase/migrations/003_rls_base.sql
src/supabase/migrations/004_enrollments_progress.sql
src/supabase/migrations/005_rls_progress.sql
src/supabase/migrations/006_subscriptions.sql
src/supabase/migrations/006b_subscription_fn.sql
src/supabase/migrations/007_rls_subscriptions.sql
src/supabase/migrations/008_assessments_certs.sql
src/supabase/migrations/008b_capstones.sql
src/supabase/migrations/009_rls_assessments.sql
src/supabase/migrations/009b_rls_capstones.sql
src/supabase/migrations/010_community.sql
src/supabase/migrations/011_rls_community.sql
src/supabase/migrations/012_teams.sql
src/supabase/migrations/013_rls_teams.sql
src/supabase/migrations/014_referrals.sql
src/supabase/migrations/015_rls_referrals.sql
src/supabase/migrations/016_ai_tutor.sql
src/supabase/migrations/017_rls_ai_tutor.sql
```

4. Go to **Authentication > URL Configuration** and set:
   - Site URL: `https://ialgeria.com` (or your domain)
   - Redirect URLs: `https://ialgeria.com/**`
5. Enable **Email** auth provider under **Authentication > Providers**

## 2. Stripe Setup

1. Create an account at [stripe.com](https://stripe.com)
2. Get your **Secret Key** from Developers > API Keys → `STRIPE_SECRET_KEY`
3. Create **Products and Prices** in the Stripe Dashboard:

| Product | Region | Interval | Price | Env Var |
|---------|--------|----------|-------|---------|
| Pro Monthly | Default (EU) | Monthly | 19.00 EUR | `STRIPE_PRICE_MONTHLY_DEFAULT` |
| Pro Annual | Default (EU) | Yearly | 190.00 EUR | `STRIPE_PRICE_ANNUAL_DEFAULT` |
| Pro Monthly | Maghreb | Monthly | 3.50 EUR | `STRIPE_PRICE_MONTHLY_MAGHREB` |
| Pro Annual | Maghreb | Yearly | 35.00 EUR | `STRIPE_PRICE_ANNUAL_MAGHREB` |
| Pro Monthly | Canada | Monthly | 25.00 CAD | `STRIPE_PRICE_MONTHLY_CANADA` |
| Pro Annual | Canada | Yearly | 250.00 CAD | `STRIPE_PRICE_ANNUAL_CANADA` |
| Pro Monthly | West Africa | Monthly | 3.80 EUR | `STRIPE_PRICE_MONTHLY_WEST_AFRICA` |
| Pro Annual | West Africa | Yearly | 38.00 EUR | `STRIPE_PRICE_ANNUAL_WEST_AFRICA` |
| Team (per seat) | Default | Monthly | your price | `STRIPE_TEAM_PRICE_ID` |

Copy each Price ID (starts with `price_`) into the corresponding env var.

4. Set up a **Webhook** in Developers > Webhooks:
   - Endpoint URL: `https://ialgeria.com/api/webhooks/stripe`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
     - `invoice.paid`
   - Copy the Signing Secret → `STRIPE_WEBHOOK_SECRET`

## 3. Upstash Redis

1. Create a database at [upstash.com](https://upstash.com)
2. Copy from the REST API tab:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

Used for API rate limiting (60/min general, 20/min mutations, 10/min auth) and AI tutor rate limiting (5/day free, 30/hr pro).

## 4. Resend (Email)

1. Create an account at [resend.com](https://resend.com)
2. Add and verify your domain (`ialgeria.com`)
3. Create an API key → `RESEND_API_KEY`
4. Emails are sent from `IAlgeria <noreply@ialgeria.com>`

## 5. Bunny.net (Video CDN)

1. Create an account at [bunny.net](https://bunny.net)
2. Create a **Stream Library** for hosting course videos
3. Copy:
   - Library ID → `BUNNY_STREAM_LIBRARY_ID`
   - API Key (from the library's Security settings) → `BUNNY_SIGNING_KEY`

Videos are served via signed URLs with 4-hour expiry.

## 6. Claude API (AI Features)

1. Get an API key from [console.anthropic.com](https://console.anthropic.com)
2. Set `ANTHROPIC_API_KEY` (the SDK reads this automatically)
3. Used by:
   - AI Tutor (claude-sonnet for streaming responses)
   - Capstone Grading (claude-sonnet for scoring student projects)
   - Content Moderation (claude-haiku for flagging community posts)

## 7. Judge0 (Code Execution)

1. Sign up at [rapidapi.com/judge0](https://rapidapi.com/judge0-official/api/judge0-ce) or self-host
2. Set:
   - `JUDGE0_API_URL` (default: `https://judge0-ce.p.rapidapi.com`)
   - `JUDGE0_API_KEY` (your RapidAPI key)

Supports Python, JavaScript, and R for lab exercises.

## 8. PostHog (Analytics, Optional)

1. Create a project at [posthog.com](https://posthog.com)
2. Set:
   - `NEXT_PUBLIC_POSTHOG_KEY`
   - `NEXT_PUBLIC_POSTHOG_HOST` (default: `https://app.posthog.com`)

## 9. Vercel Deployment

1. Push your repo to GitHub
2. Import the project in [vercel.com](https://vercel.com)
3. Add ALL env vars listed below to the Vercel project settings
4. Deploy

The `vercel.json` configures a weekly digest cron (Mondays 9 AM UTC). Generate a random secret for `CRON_SECRET` (Vercel sends this as a Bearer token).

## Full .env.local Template

Copy this to `.env.local` for local development, and add each to Vercel for production:

```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_MONTHLY_DEFAULT=
STRIPE_PRICE_ANNUAL_DEFAULT=
STRIPE_PRICE_MONTHLY_MAGHREB=
STRIPE_PRICE_ANNUAL_MAGHREB=
STRIPE_PRICE_MONTHLY_CANADA=
STRIPE_PRICE_ANNUAL_CANADA=
STRIPE_PRICE_MONTHLY_WEST_AFRICA=
STRIPE_PRICE_ANNUAL_WEST_AFRICA=
STRIPE_TEAM_PRICE_ID=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Resend
RESEND_API_KEY=

# Bunny.net Video
BUNNY_STREAM_LIBRARY_ID=
BUNNY_SIGNING_KEY=

# Claude API (read automatically by @anthropic-ai/sdk)
ANTHROPIC_API_KEY=

# Judge0
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=

# PostHog (optional)
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Cron
CRON_SECRET=

# Email Unsubscribe (generate with: openssl rand -hex 32)
UNSUBSCRIBE_SECRET=
```

## Post-Deploy Checklist

- [ ] Run all 17 SQL migrations in Supabase
- [ ] Verify Supabase auth works (sign up, log in)
- [ ] Create at least one course with modules and lessons in the DB
- [ ] Upload a video to Bunny.net and link it to a lesson
- [ ] Test Stripe checkout flow (use test mode keys first)
- [ ] Verify Stripe webhooks arrive (check Stripe dashboard > Webhooks > Logs)
- [ ] Send a test email via Resend
- [ ] Test AI tutor with a real question
- [ ] Create your first admin user: in Supabase SQL Editor, run:
  ```sql
  UPDATE public.users SET role = 'admin' WHERE email = 'your@email.com';
  ```
- [ ] Set production URLs: update `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_SITE_URL` to your real domain
- [ ] Set up Stripe live mode keys when ready to accept real payments

## Domain and DNS

If using a custom domain on Vercel:
1. Add the domain in Vercel project settings
2. Point your DNS:
   - `A` record → `76.76.21.21`
   - `CNAME` for `www` → `cname.vercel-dns.com`
3. Update Supabase redirect URLs to include your domain
4. Update Stripe webhook endpoint URL to your domain
