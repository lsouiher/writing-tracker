# Implementation Plan: Francophone AI Learning Platform

**Branch**: `001-francophone-ai-platform` | **Date**: 2026-04-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-francophone-ai-platform/spec.md`

## Summary

Build a French-first freemium AI learning platform with free video courses and a Pro tier ($19/mo) that unlocks interactive labs, AI tutor, quizzes, certificates, and community posting. The platform targets francophone professionals/students in France, Quebec, and the Maghreb with PPP pricing. Built on Next.js 14+ (App Router) with Supabase for auth/DB/storage, Stripe for payments, Bunny.net for video CDN, and Claude API for the AI tutor. Solo-developer architecture optimized for <$20/mo launch cost.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20 LTS  
**Framework**: Next.js 14+ (App Router, Server Components, Route Handlers)  
**Primary Dependencies**: Supabase (auth + Postgres + storage + realtime + RLS), Stripe (@stripe/stripe-js + stripe), Bunny.net Stream (video CDN), Claude API (@anthropic-ai/sdk), Resend + React Email, PostHog, Upstash Redis (@upstash/redis), Monaco Editor (@monaco-editor/react), Judge0 API  
**Storage**: Supabase PostgreSQL (RLS-enforced), Upstash Redis (rate limiting + cache), Bunny.net Storage (video assets)  
**Testing**: Vitest (unit + integration), Playwright (E2E critical paths)  
**Target Platform**: Web (Vercel deployment, edge functions for geolocation)  
**Project Type**: Web application (SaaS)  
**Performance Goals**: Page load <3s globally, AI tutor response <5s, video playback start <3s, API responses <500ms p95  
**Constraints**: <$20/mo launch cost (all free/starter tiers), solo developer, GDPR-compliant, SCA-compliant payments  
**Scale/Scope**: 5,000 users in 6 months, ~50 Pro subscribers target, 12 key tables, ~30 pages/views

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Evaluation

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Simplicity Is the First Feature | ✅ PASS | Supabase consolidates auth+DB+storage+realtime into one service. Bunny.net handles video complexity. No custom abstractions planned. |
| II | Dependencies | ✅ PASS | Each dependency solves a domain the platform cannot reasonably build: auth (Supabase), payments (Stripe), video CDN (Bunny.net), AI (Claude), email (Resend). No redundant or trivial libs. |
| III | Code Structure | ✅ PASS | Architecture principles mandate one concern per file, layer separation via `/types`, `/lib/supabase`, `/lib/stripe`, `/app/api/`. Co-located tests. |
| IV | Data & Persistence | ✅ PASS | Soft deletes for user data, opaque UUIDs, append-only migrations, required fields by default, FK indexes mandatory. |
| V | APIs & Server-Side Logic | ✅ PASS | All writes via Next.js Route Handlers (server-side). Stripe webhooks as source of truth for subscription state. Secrets server-only via env vars. Rate limiting via Upstash Redis. |
| VI | Auth & Authorization | ✅ PASS | Supabase Auth centralized. RLS policies enforce Free/Pro tier access at DB level. No client-side auth trust. |
| VII | Frontend | ✅ PASS | Next.js App Router = server rendering by default. Client components only for interactive features (video player, Monaco editor, AI tutor chat). |
| VIII | Testing | ✅ PASS | Vitest for fast unit/integration (<2s), Playwright for critical E2E paths. External services mocked in tests. CI blocks on failure. |
| IX | Performance | ✅ PASS | Video via Bunny.net CDN, explicit targets defined (3s page load, 5s AI response). PostHog for measurement. |
| X | Security | ✅ PASS | Secrets in env vars, user content sanitized, GDPR built-in (PostHog self-host option), signed video URLs, Supabase RLS. |

**Gate result: ✅ ALL PASS — proceed to Phase 0.**

## Project Structure

### Documentation (this feature)

```text
specs/001-francophone-ai-platform/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── api-routes.md
│   ├── webhook-contracts.md
│   └── ai-tutor-contract.md
└── tasks.md             # Phase 2 output (via /speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (auth)/              # Login, register, password reset
│   ├── (marketing)/         # Landing, pricing, teams pages
│   ├── (platform)/          # Dashboard, courses, lessons, labs
│   │   ├── dashboard/
│   │   ├── courses/
│   │   │   └── [courseSlug]/
│   │   │       └── [lessonSlug]/
│   │   ├── community/
│   │   ├── certificates/
│   │   └── referral/
│   ├── (admin)/             # Admin panel
│   ├── api/
│   │   ├── webhooks/
│   │   │   └── stripe/
│   │   ├── ai-tutor/
│   │   ├── labs/
│   │   └── certificates/
│   └── layout.tsx
├── components/
│   ├── ui/                  # Shared UI primitives
│   ├── course/              # Course cards, progress bars
│   ├── video/               # Player, transcript viewer
│   ├── lab/                 # Monaco editor wrapper
│   ├── ai-tutor/            # Chat sidebar
│   └── community/           # Forum components
├── lib/
│   ├── supabase/
│   │   ├── client.ts        # Browser client
│   │   ├── server.ts        # Server client
│   │   ├── middleware.ts     # Auth middleware
│   │   └── queries/         # Data access functions
│   ├── stripe/
│   │   ├── client.ts
│   │   ├── webhooks.ts
│   │   └── pricing.ts       # PPP logic
│   ├── ai-tutor/
│   │   ├── client.ts        # Claude API wrapper
│   │   └── prompts.ts       # System prompts
│   ├── bunny/
│   │   └── signed-urls.ts
│   ├── redis/
│   │   └── rate-limit.ts
│   ├── email/
│   │   └── templates/
│   └── certificates/
│       └── generate.ts
├── types/
│   ├── database.ts          # Supabase generated types
│   ├── stripe.ts
│   └── domain.ts
└── supabase/
    ├── migrations/
    └── seed.sql
```

**Structure Decision**: Single Next.js application with modular `/lib` for service boundaries and `/app` route groups for logical separation. No separate backend — Next.js Route Handlers serve as the API layer. This is the simplest structure that supports SSR, API routes, and edge functions in one deployable unit.

## Constitution Re-Check (Post Phase 1 Design)

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Simplicity | ✅ PASS | Single Next.js app, no microservices. JSONB for quiz questions avoids a separate questions table. |
| II | Dependencies | ✅ PASS | 10 runtime deps, each covering a distinct domain. No overlapping libs. |
| III | Code Structure | ✅ PASS | `/lib/` layer separation (supabase, stripe, ai-tutor, bunny). Route handlers are pure API logic. Co-located tests planned. |
| IV | Data & Persistence | ✅ PASS | Soft deletes on users + team_members. UUIDs as PKs, slugs in URLs. Append-only migrations. All nullable fields documented. All FKs indexed. |
| V | APIs & Server-Side | ✅ PASS | All writes via Route Handlers. Stripe webhooks as source of truth. Consistent `{data, error}` response shape. Rate limiting on AI tutor + public endpoints. |
| VI | Auth & Authorization | ✅ PASS | Supabase RLS centralized. Two tiers (free/pro) + admin role. No client-side auth trust. |
| VII | Frontend | ✅ PASS | Server Components by default. Client components only for video player, Monaco editor, AI chat, upvote buttons. |
| VIII | Testing | ✅ PASS | Vitest (<2s), Playwright for 5 critical paths. MSW for external mocking. CI blocks on failure. |
| IX | Performance | ✅ PASS | Bunny.net CDN for video. Explicit targets: 3s load, 5s AI response. Redis caching. |
| X | Security | ✅ PASS | Env vars for secrets, signed video URLs, content sanitization, GDPR via PostHog cookie-less mode. |

**Post-design gate result: ✅ ALL PASS**

## Complexity Tracking

> No constitution violations detected. No complexity justifications needed.
