# Research: Francophone AI Learning Platform

**Date**: 2026-04-01 | **Status**: Complete

## R-001: Supabase RLS for Freemium Tier Gating

**Decision**: Use Supabase Row-Level Security policies that check a `subscription_tier` column on the `users` table (or join to `subscriptions`) to enforce Free/Pro access at the database level.

**Rationale**: RLS policies execute on every query automatically, making it impossible for application bugs to leak Pro content to free users. This aligns with Constitution VI (centralized authorization) and eliminates scattered access checks in application code.

**Alternatives considered**:
- **Application-level middleware only**: Simpler to implement but relies on every endpoint correctly checking tier. One missed check = data leak. Rejected for security reasons.
- **Separate databases per tier**: Massive over-engineering for this scale. Rejected per Constitution I (simplicity).

**Implementation notes**:
- Create a `subscription_status()` SQL function that returns the user's current tier
- RLS policies on `labs`, `quiz_results`, `ai_tutor_logs`, `certificates` use `subscription_status() = 'pro'`
- Free-tier content (courses, lessons, modules) has permissive read policies
- Community posts: read for all authenticated, write only for Pro

---

## R-002: Stripe Integration with PPP Pricing

**Decision**: Use Stripe Products with multiple Prices per product (one per region/currency). Detect region via Vercel Edge `request.geo` at checkout time. Map country to a price ID. Store Stripe `customer_id` and `subscription_id` in Supabase.

**Rationale**: Stripe natively supports multi-currency pricing and SCA. Vercel Edge geolocation is free and available at the middleware level, making PPP detection zero-cost. Webhook-driven state sync ensures the Supabase DB is the source of truth (Constitution V).

**Alternatives considered**:
- **Single price with Stripe coupons per region**: Coupon management becomes unwieldy. Harder to report revenue by region. Rejected.
- **Third-party PPP service (Paritydeals)**: Additional dependency for something achievable with a simple country→price lookup table. Rejected per Constitution II.

**Implementation notes**:
- Price tiers: EUR (default), EUR-Maghreb (~80% discount), CAD, USD
- Country detection: Vercel Edge `request.geo.country` → lookup table → Stripe Price ID
- Billing address at checkout overrides IP-based detection
- Stripe webhooks handled: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.paid`
- Grace period: 3 retries over 7 days (Stripe Smart Retries + `invoice.payment_failed` webhook triggers user notification)

---

## R-003: Bunny.net Video Streaming with Signed URLs

**Decision**: Use Bunny.net Stream for video hosting with signed URL token authentication. Videos are uploaded to Bunny.net via their API, and playback URLs are generated server-side with time-limited tokens.

**Rationale**: Bunny.net Stream provides adaptive bitrate, global CDN, and DRM-lite via signed URLs at $1/1K views — the cheapest option at this scale. Signed URLs satisfy the spec requirement (FR-005) without full DRM complexity. Constitution IX (CDN for media assets) is directly satisfied.

**Alternatives considered**:
- **Mux**: Superior developer experience but $0.007/min encoding + $0.005/min delivery. At scale, 3-5x more expensive. Rejected for cost.
- **Self-hosted with Cloudflare Stream**: More operational burden. Rejected per Constitution I.
- **YouTube unlisted embeds**: No signed URL control, no chapter navigation API, branding issues. Rejected.

**Implementation notes**:
- Upload flow: Admin uploads via Bunny.net dashboard or API (future: admin panel upload)
- Signed URL generation: HMAC-SHA256 with expiry (4 hours), generated in Route Handler
- Player: Bunny.net's built-in player (iframe embed) with chapter navigation via their API
- Transcripts: Stored in Supabase, synchronized by timestamp, rendered alongside player
- Subtitle tracks (FR/EN): Uploaded as WebVTT files to Bunny.net

---

## R-004: Claude API for French-First AI Tutor

**Decision**: Use Claude Sonnet via the Anthropic SDK with a carefully crafted French system prompt. Context window includes the lesson transcript + module context. Rate-limited via Upstash Redis.

**Rationale**: Claude Sonnet excels at French, is cost-effective (~$0.003/question), and the SDK is straightforward. Using lesson transcript as context grounds answers in course material (FR-013 topic constraint). Upstash Redis handles rate limiting without a separate service (Constitution II).

**Alternatives considered**:
- **OpenAI GPT-4o-mini**: Comparable cost but weaker French performance in testing. Rejected.
- **Self-hosted LLM (Mistral)**: Operational burden incompatible with solo developer + <$20/mo constraint. Rejected.
- **RAG with vector embeddings**: Over-engineered for V1 where transcript context fits in a single prompt. Rejected per Constitution I. Revisit if courses exceed context window.

**Implementation notes**:
- System prompt: French-only, constrained to lesson/module content, graceful off-topic decline
- Context: Full lesson transcript + module overview + previous 3 messages in session
- Rate limiting: Upstash Redis — free users: 5 questions/day (key: `ai:{userId}:daily`), Pro: unlimited but 30/hour burst limit
- Streaming: Use Claude streaming API for perceived responsiveness (<5s first token)
- Logging: All Q&A pairs stored in `ai_tutor_logs` for quality review (FR-023)

---

## R-005: Browser-Based Code Labs (Monaco + Judge0)

**Decision**: Use Monaco Editor (@monaco-editor/react) for the code editing UI and Judge0 API for sandboxed code execution. Student code is persisted in Supabase.

**Rationale**: Monaco provides VS Code-quality editing in the browser with zero backend infrastructure. Judge0 handles sandboxed execution of Python/JS/R code with timeout protection. Both are free/cheap at launch scale. Constitution I satisfied — no custom sandbox infrastructure.

**Alternatives considered**:
- **CodeMirror**: Lighter but less feature-rich. Monaco's familiarity (VS Code users) is a UX advantage for the target audience. Accepted trade-off.
- **Gitpod/Codespaces**: Full IDE is overkill and expensive for exercise-sized code. Deferred to later phases per spec.
- **WebContainer (StackBlitz)**: Node.js only, doesn't support Python which is primary for AI courses. Rejected.

**Implementation notes**:
- Monaco loaded client-side only (dynamic import, no SSR)
- Languages: Python 3 (primary for AI), JavaScript, R (data science)
- Judge0: Self-hosted on a small VPS if free tier limits hit, otherwise CE API
- Execution timeout: 10 seconds, memory limit: 256MB
- Code persistence: `lab_submissions` table with `user_id`, `lab_id`, `code`, `result`, `submitted_at`
- Pre-configured starter code and test cases stored in `labs` table

---

## R-006: Certificate Generation

**Decision**: Generate branded PDF certificates server-side using `@react-pdf/renderer` with a unique verification UUID. Store metadata in Supabase, serve PDF from Supabase Storage.

**Rationale**: @react-pdf/renderer uses React components for PDF layout — consistent with the rest of the stack (Constitution III, same mental model). Verification via a public `/verify/[code]` page that queries Supabase. No external certificate service needed.

**Alternatives considered**:
- **Puppeteer/Playwright PDF**: Heavier runtime, needs a browser binary. Problematic on Vercel serverless. Rejected.
- **Accredible/Certifier**: Third-party dependency for something achievable with a PDF library. Rejected per Constitution II.

**Implementation notes**:
- Trigger: All lessons + labs + quizzes (≥70%) + capstone completed → auto-generate
- PDF content: User name, course title, completion date, unique verification code, platform branding
- Verification URL: `https://ialgeria.com/verify/[uuid]` — public, no auth required
- Storage: Generated PDF uploaded to Supabase Storage (public bucket with UUID-based paths)

---

## R-007: Email System (Resend + React Email)

**Decision**: Use Resend for transactional email delivery with React Email for template rendering. Templates are React components co-located in `/lib/email/templates/`.

**Rationale**: React Email templates are type-safe and use the same component model as the rest of the app. Resend's free tier (100 emails/day) covers launch scale. One dependency for email, not two (Constitution II).

**Alternatives considered**:
- **SendGrid**: More established but heavier SDK and less developer-friendly template system. Rejected for simplicity.
- **AWS SES**: Cheapest at scale but requires AWS account setup and more configuration. Overkill for launch. Deferred.

**Implementation notes**:
- Transactional emails: Welcome, trial start, trial ending (day 5), payment failed, payment success, certificate ready
- Weekly digest: Cron job (Vercel Cron) aggregates top posts + new courses, sends via Resend batch API
- Templates: French-first with EN toggle based on user language preference
- Unsubscribe: One-click unsubscribe link in all marketing emails (GDPR)

---

## R-008: Testing Strategy

**Decision**: Vitest for unit and integration tests, Playwright for E2E. Supabase local dev (Docker) for integration tests with real database. MSW (Mock Service Worker) for external API mocking.

**Rationale**: Vitest is fast (Constitution VIII: <2s per test), compatible with the TypeScript/React ecosystem, and supports both unit and integration patterns. Playwright covers critical user paths. MSW intercepts HTTP at the network level, keeping tests realistic without hitting real services.

**Alternatives considered**:
- **Jest**: Slower than Vitest, less native ESM support. Rejected.
- **Cypress**: Heavier than Playwright, paid dashboard features. Rejected for cost.

**Implementation notes**:
- Unit tests: Business logic in `/lib/` — pricing calculations, rate limit logic, certificate eligibility checks
- Integration tests: API Route Handlers against Supabase local dev
- E2E tests: 5 critical paths — browse catalog, sign up, start trial, complete lesson, verify certificate
- CI: GitHub Actions — run Vitest on every push, Playwright on PR to main
- Co-located tests: `pricing.ts` → `pricing.test.ts` in same directory

---

## R-009: PostHog Analytics (GDPR-Compliant)

**Decision**: Use PostHog Cloud initially (free tier: 1M events/month) with cookie-less tracking mode. Self-host later if needed for full GDPR compliance.

**Rationale**: PostHog covers funnels, session replay, and feature flags in one tool (Constitution II — fewer dependencies). Cookie-less mode avoids consent banners for basic analytics. The 1M event free tier is sufficient for launch scale.

**Implementation notes**:
- Key funnels: Visit → Sign up → Enroll → Trial → Pro conversion
- Feature flags: Used to gate beta features (e.g., new lab types)
- Session replay: Enabled for Pro conversion pages to optimize UX
- GDPR: Cookie-less mode for basic analytics; consent banner only if session replay enabled

---

## R-010: Community Forum Architecture

**Decision**: Build a simple threaded Q&A system using Supabase tables + Realtime for live updates. No external forum service.

**Rationale**: The community requirements (course-specific Q&A, threaded posts, upvotes, moderation) are simple enough to build with Supabase queries and RLS. An external forum (Discourse, Circle) would be a heavy dependency for basic threading. Constitution I — simplest option that works.

**Alternatives considered**:
- **Discourse embedded**: Feature-rich but heavy, requires separate hosting, complex styling. Rejected.
- **Circle.so**: SaaS cost + external dependency. Rejected per Constitution II.

**Implementation notes**:
- Tables: `community_posts` (with `parent_id` for threading), `post_votes`, `moderation_flags`
- RLS: Read for all authenticated, write for Pro users only
- Realtime: Supabase Realtime for live post updates on active threads
- Moderation: Claude API call on post submission to flag content, stored in `moderation_flags` for admin review
- Pagination: Cursor-based for performance on growing threads
