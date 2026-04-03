# Tasks: Francophone AI Learning Platform

**Input**: Design documents from `/specs/001-francophone-ai-platform/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in the feature specification. Test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependency installation, and baseline configuration

- [x] T001 Initialize Next.js 14+ project with TypeScript, Tailwind, App Router, and src/ directory using `create-next-app`
- [x] T002 Install all runtime dependencies: @supabase/supabase-js, @supabase/ssr, stripe, @stripe/stripe-js, @anthropic-ai/sdk, resend, @react-email/components, @upstash/redis, @upstash/ratelimit, @monaco-editor/react, @react-pdf/renderer, nanoid, posthog-js, posthog-node
- [x] T003 Install dev dependencies: vitest, @testing-library/react, playwright, supabase CLI
- [x] T004 [P] Create `.env.local.example` with all environment variable placeholders per `specs/001-francophone-ai-platform/quickstart.md`
- [x] T005 [P] Configure Vitest in `vitest.config.ts` with path aliases and TypeScript support
- [x] T006 [P] Configure Playwright in `playwright.config.ts` for E2E critical paths
- [x] T007 Create base app layout with French-first metadata and font configuration in `src/app/layout.tsx`
- [x] T008 [P] Create shared TypeScript domain types in `src/types/domain.ts` (SubscriptionTier, UserRole, CourseLevel, SubscriptionStatus enums)
- [x] T009 [P] Create Stripe-specific types in `src/types/stripe.ts` (PriceRegion, CheckoutParams, WebhookEvent types)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T010 Initialize Supabase project with `npx supabase init` and configure `supabase/config.toml`
- [x] T011 Create Supabase migration for `users` table with all columns, indexes, and soft delete per `data-model.md` in `src/supabase/migrations/001_users.sql`
- [x] T012 Create Supabase migration for `courses`, `modules`, `lessons` tables with all columns, indexes, and relationships in `src/supabase/migrations/002_content.sql`
- [x] T013 Create RLS policies for `users` (own row read/write), `courses`/`modules`/`lessons` (public read, admin write) in `src/supabase/migrations/003_rls_base.sql`
- [x] T013b Implement Supabase `subscription_status(user_uuid)` SQL function returning 'free' or 'pro' by querying subscriptions table, in `src/supabase/migrations/003b_subscription_fn.sql` — required by all Pro-gated RLS policies in later phases
- [x] T014 [P] Implement Supabase server client factory in `src/lib/supabase/server.ts` using @supabase/ssr with cookie handling
- [x] T015 [P] Implement Supabase browser client factory in `src/lib/supabase/client.ts`
- [x] T016 Implement auth middleware in `src/middleware.ts` that refreshes Supabase session on every request and protects `/dashboard`, `/admin` routes
- [x] T017 [P] Generate Supabase TypeScript types and save to `src/types/database.ts` using `npx supabase gen types`
- [x] T018 [P] Implement consistent API response helpers (`successResponse`, `errorResponse`) in `src/lib/api/response.ts` per contracts/api-routes.md response shape
- [x] T019 [P] Create shared UI primitives: Button, Card, Badge, Input, Modal components in `src/components/ui/`
- [x] T020 Create seed data script with sample courses, modules, and lessons in `src/supabase/seed.sql`
- [x] T021 [P] Implement PostHog provider wrapper in `src/components/providers/posthog-provider.tsx` with cookie-less tracking mode
- [x] T022 [P] Create `src/lib/supabase/queries/users.ts` with `getUserProfile()`, `updateUserProfile()` data access functions (note: `getUserTier()` lives in `queries/subscriptions.ts` — see T050)

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Browse and Watch Free Course Videos (Priority: P1) 🎯 MVP

**Goal**: Visitors can browse the course catalog, watch free preview lessons without login, and registered free users can track their progress on a dashboard.

**Independent Test**: Visit the platform → browse catalog → filter by level → watch a free preview without login → create an account → watch a lesson → verify progress shows on dashboard.

### Implementation for User Story 1

- [x] T023 Create Supabase migration for `enrollments` and `progress` tables with all columns, indexes, and unique constraints in `src/supabase/migrations/004_enrollments_progress.sql`
- [x] T024 Create RLS policies for `enrollments` (own rows, authenticated insert) and `progress` (own rows, authenticated upsert) in `src/supabase/migrations/005_rls_progress.sql`
- [x] T025 [P] [US1] Implement course data access functions in `src/lib/supabase/queries/courses.ts`: `getPublishedCourses(level?)`, `getCourseBySlug(slug)`, `getCourseWithModules(slug)`
- [x] T026 [P] [US1] Implement progress data access functions in `src/lib/supabase/queries/progress.ts`: `getUserProgress(userId, courseId)`, `upsertLessonProgress(userId, lessonId, position, completed)`, `getEnrollments(userId)`
- [x] T027 [P] [US1] Implement Bunny.net signed URL generation in `src/lib/bunny/signed-urls.ts` with HMAC-SHA256 and 4-hour expiry
- [x] T028 [US1] Implement `GET /api/courses` Route Handler in `src/app/api/courses/route.ts` with level filter and pagination per contracts/api-routes.md
- [x] T029 [US1] Implement `GET /api/courses/[slug]` Route Handler in `src/app/api/courses/[slug]/route.ts` returning course with modules and lessons
- [x] T030 [US1] Implement `GET /api/lessons/[slug]/video` Route Handler in `src/app/api/lessons/[slug]/video/route.ts` with signed URL generation and free preview check
- [x] T031 [US1] Implement `POST /api/progress` Route Handler in `src/app/api/progress/route.ts` for lesson position and completion updates
- [x] T032 [US1] Implement `POST /api/enrollments` Route Handler in `src/app/api/enrollments/route.ts` for course enrollment
- [x] T033 [P] [US1] Create CourseCard component in `src/components/course/course-card.tsx` displaying title, level badge, duration, thumbnail
- [x] T034 [P] [US1] Create CourseProgressBar component in `src/components/course/progress-bar.tsx` showing module and overall completion
- [x] T035 [US1] Build course catalog page (Server Component) in `src/app/(marketing)/courses/page.tsx` with level filter tabs and course grid
- [x] T036 [US1] Build course detail page in `src/app/(platform)/courses/[courseSlug]/page.tsx` showing modules, lessons, and enrollment button
- [x] T037 [P] [US1] Create VideoPlayer client component in `src/components/video/video-player.tsx` with Bunny.net iframe embed, chapter navigation, playback speed (0.5x-2x), quality selection
- [x] T038 [P] [US1] Create TranscriptViewer client component in `src/components/video/transcript-viewer.tsx` with synchronized French transcript and click-to-seek
- [x] T039 [US1] Build lesson page in `src/app/(platform)/courses/[courseSlug]/[lessonSlug]/page.tsx` with video player, transcript sidebar, auto-resume from last position, and progress tracking on completion
- [x] T040 [US1] Build auth pages: login in `src/app/(auth)/login/page.tsx`, register in `src/app/(auth)/register/page.tsx`, and password reset in `src/app/(auth)/reset-password/page.tsx` with email + Google OAuth, French-first UI
- [x] T041 [US1] Build user dashboard page in `src/app/(platform)/dashboard/page.tsx` showing enrolled courses, per-lesson completion, module progress bars, overall percentage
- [x] T042 [US1] Implement `GET /api/dashboard` Route Handler in `src/app/api/dashboard/route.ts` aggregating enrollments, progress, and subscription status
- [x] T043 [US1] Build landing page in `src/app/(marketing)/page.tsx` with hero section, featured courses, value proposition in French
- [x] T044 [US1] Implement French SEO meta tags, Open Graph tags, and Course structured data (JSON-LD) in `src/app/(marketing)/courses/page.tsx` and `src/app/(marketing)/page.tsx` per FR-024
- [x] T045 [US1] Add French/English subtitle track support (WebVTT) to VideoPlayer component in `src/components/video/video-player.tsx` per FR-026

**Checkpoint**: Visitors can browse courses, watch free previews, create accounts, and track progress. Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 — Free-to-Pro Conversion via Trial (Priority: P1)

**Goal**: Free users encounter paywalls on locked features, start a 7-day Pro trial with payment method, and auto-convert to paid at trial end. PPP pricing is auto-applied by region.

**Independent Test**: Create a free account → encounter a locked feature → start a trial → access Pro features → verify auto-conversion after 7 days. Verify PPP pricing for Algerian IP.

### Implementation for User Story 2

- [x] T046 Create Supabase migration for `subscriptions` and `coupons` tables with all columns, indexes, state transitions, and unique constraints in `src/supabase/migrations/006_subscriptions.sql`
- [x] T047 Create RLS policies for `subscriptions` (own row read, server-only write) and `coupons` (server-only) in `src/supabase/migrations/007_rls_subscriptions.sql`
- [x] T048 [P] [US2] Implement PPP pricing logic in `src/lib/stripe/pricing.ts`: country-to-price-region mapping, Stripe Price ID lookup by region and plan (monthly/annual)
- [x] T049 [P] [US2] Implement Stripe client initialization in `src/lib/stripe/client.ts` with server-only secret key
- [x] T050 [P] [US2] Implement subscription data access in `src/lib/supabase/queries/subscriptions.ts`: `getActiveSubscription(userId)`, `upsertSubscription(data)`, `getUserTier(userId)`
- [x] T051 [US2] Implement `POST /api/stripe/checkout` Route Handler in `src/app/api/stripe/checkout/route.ts` creating Checkout session with PPP pricing, trial period, and optional coupon
- [x] T052 [US2] Implement `POST /api/stripe/portal` Route Handler in `src/app/api/stripe/portal/route.ts` creating Customer Portal session for subscription management
- [x] T053 [US2] Implement Stripe webhook handler in `src/app/api/webhooks/stripe/route.ts` with signature verification, handling all 6 events per contracts/webhook-contracts.md (checkout.session.completed, subscription.created/updated/deleted, invoice.payment_failed, invoice.paid)
- [x] T054 [US2] Implement subscription state sync logic in `src/lib/stripe/webhooks.ts`: process each webhook event type, update subscriptions table, trigger email notifications
- [x] T055 [P] [US2] Create PaywallPrompt component in `src/components/ui/paywall-prompt.tsx` shown when free users access locked features (labs, quizzes, certificates, AI tutor)
- [x] T056 [P] [US2] Create email templates in `src/lib/email/templates/`: welcome.tsx, trial-started.tsx, trial-ending.tsx (day 5), payment-failed.tsx, payment-success.tsx, subscription-canceled.tsx
- [x] T057 [P] [US2] Implement email sending functions in `src/lib/email/send.ts` using Resend SDK with French-first templates
- [x] T058 [US2] Build pricing page in `src/app/(marketing)/pricing/page.tsx` showing Free vs Pro comparison, PPP-adjusted prices detected via Vercel Edge geolocation, monthly/annual toggle
- [x] T059 [US2] Add geolocation-based country detection in `src/middleware.ts` using Vercel Edge `request.geo` and pass country via cookie/header
- [x] T060 [US2] Integrate paywall prompts into lesson page (`src/app/(platform)/courses/[courseSlug]/[lessonSlug]/page.tsx`) for non-preview lessons when user is free tier
- [x] T061 [US2] Add subscription status display to dashboard in `src/app/(platform)/dashboard/page.tsx` showing plan, trial countdown, billing portal link

**Checkpoint**: Free-to-Pro conversion funnel is complete. Users can start trials, get auto-converted, manage subscriptions, and see PPP pricing.

---

## Phase 5: User Story 3 — Complete a Course and Earn a Certificate (Priority: P2)

**Goal**: Pro users complete interactive labs, pass quizzes, submit capstone projects, and receive verifiable PDF certificates.

**Independent Test**: Enroll as Pro user → complete all lessons → complete a lab exercise → pass module quiz (≥70%) → submit capstone → verify certificate PDF generates with working verification URL.

### Implementation for User Story 3

- [x] T062 Create Supabase migration for `quizzes`, `quiz_results`, `labs`, `lab_submissions`, `certificates` tables in `src/supabase/migrations/008_assessments_certs.sql`
- [x] T063 Create RLS policies: quizzes/labs (authenticated read, admin write), quiz_results/lab_submissions (Pro own rows), certificates (own rows + public verify) in `src/supabase/migrations/009_rls_assessments.sql`
- [x] T064 [P] [US3] Implement quiz data access in `src/lib/supabase/queries/quizzes.ts`: `getQuizByModule(moduleId)`, `submitQuizResult(userId, quizId, answers)`, `getQuizResults(userId, courseId)`
- [x] T065 [P] [US3] Implement lab data access in `src/lib/supabase/queries/labs.ts`: `getLabByModule(moduleId)`, `saveLabSubmission(userId, labId, code, result)`, `getLabSubmissions(userId, courseId)`
- [x] T066 [P] [US3] Implement certificate data access in `src/lib/supabase/queries/certificates.ts`: `checkCertificateEligibility(userId, courseId)`, `createCertificate(userId, courseId)`, `getCertificateByCode(code)`
- [x] T067 [US3] Implement `POST /api/quizzes/[quizId]/submit` Route Handler in `src/app/api/quizzes/[quizId]/submit/route.ts` with auto-grading, 70% pass threshold, French feedback per contracts/api-routes.md
- [x] T068 [US3] Implement `POST /api/labs/[labId]/submit` Route Handler in `src/app/api/labs/[labId]/submit/route.ts` calling Judge0 API for sandboxed execution (Python/JS/R, 10s timeout, 256MB limit)
- [x] T069 [US3] Implement certificate PDF generation in `src/lib/certificates/generate.ts` using @react-pdf/renderer with branded layout, user name, course title, date, verification code
- [x] T070 [US3] Implement `POST /api/certificates/generate` Route Handler in `src/app/api/certificates/route.ts` that checks eligibility, generates PDF, uploads to Supabase Storage, creates DB record
- [x] T071 [US3] Implement `GET /api/verify/[code]` Route Handler in `src/app/api/verify/[code]/route.ts` returning certificate holder name, course, and date (public, no auth)
- [x] T072 [P] [US3] Create MonacoLab client component in `src/components/lab/monaco-lab.tsx` with @monaco-editor/react, dynamic import (no SSR), language selector, starter code loading, run button
- [x] T073 [P] [US3] Create QuizForm client component in `src/components/course/quiz-form.tsx` with MCQ + short answer inputs, instant feedback display in French, retry support
- [x] T074 [US3] Build lab exercise page in `src/app/(platform)/courses/[courseSlug]/[lessonSlug]/lab/page.tsx` with Monaco editor, test case display, submission results (Pro-only with paywall)
- [x] T075 [US3] Build quiz page in `src/app/(platform)/courses/[courseSlug]/modules/[moduleSlug]/quiz/page.tsx` with quiz form, score display, pass/fail feedback (Pro-only with paywall)
- [x] T076 [US3] Build certificate verification page (public) in `src/app/verify/[code]/page.tsx` displaying holder name, course title, and completion date
- [x] T077 [US3] Build certificates list page in `src/app/(platform)/certificates/page.tsx` showing earned certificates with download links
- [x] T078 [US3] Add certificate download and lab/quiz completion status to dashboard in `src/app/(platform)/dashboard/page.tsx`
- [x] T138 Create Supabase migration for `capstone_submissions` and `capstone_reviews` tables in `src/supabase/migrations/008b_capstones.sql`
- [x] T139 Create RLS policies for capstone_submissions (Pro own rows + course peers if peer_review_open) and capstone_reviews (Pro on open submissions) in `src/supabase/migrations/009b_rls_capstones.sql`
- [x] T140 [P] [US3] Implement capstone data access in `src/lib/supabase/queries/capstones.ts`: `submitCapstone(userId, courseId, data)`, `getCapstone(userId, courseId)`, `getOpenCapstones(courseId)`, `submitReview(submissionId, reviewerId, data)`
- [x] T141 [US3] Implement capstone AI grading Route Handler in `src/app/api/capstones/[submissionId]/grade/route.ts` using Claude API with course rubric context, French feedback, 70% pass threshold
- [x] T142 [US3] Implement `POST /api/capstones` Route Handler in `src/app/api/capstones/route.ts` for capstone submission (Pro only)
- [x] T143 [US3] Implement `POST /api/capstones/[submissionId]/review` Route Handler in `src/app/api/capstones/[submissionId]/review/route.ts` for peer review submission (Pro only, on open submissions)
- [x] T144 [US3] Build capstone submission page in `src/app/(platform)/courses/[courseSlug]/capstone/page.tsx` with project description form, code/repo submission, AI grading status, peer reviews display
- [x] T145 [US3] Update certificate eligibility check in `src/lib/supabase/queries/certificates.ts` to require capstone approval (status='approved') in addition to lessons, labs, and quizzes

**Checkpoint**: Pro users can complete full courses with labs, quizzes, capstone projects, and earn verifiable certificates.

---

## Phase 6: User Story 4 — Participate in the Community (Priority: P2)

**Goal**: Pro users post questions on course-specific Q&A forums, free users can read. AI moderation flags inappropriate content. Weekly digest emails sent.

**Independent Test**: Post a question as Pro user → reply as another Pro user → verify free user can read but not post → verify weekly digest email is sent → verify flagged content appears in moderation queue.

### Implementation for User Story 4

- [x] T079 Create Supabase migration for `community_posts`, `post_votes`, `moderation_flags` tables in `src/supabase/migrations/010_community.sql`
- [x] T080 Create RLS policies: community_posts (authenticated read, Pro write), post_votes (Pro own rows), moderation_flags (admin only) in `src/supabase/migrations/011_rls_community.sql`
- [x] T081 [P] [US4] Implement community data access in `src/lib/supabase/queries/community.ts`: `getPostsByCourse(courseSlug, sort, cursor)`, `createPost(data)`, `createReply(data)`, `toggleVote(userId, postId)`, `getFlaggedPosts()`
- [x] T082 [P] [US4] Implement AI content moderation in `src/lib/ai-tutor/moderation.ts` using Claude API to classify post content and flag violations with reason
- [x] T083 [US4] Implement `GET /api/community/[courseSlug]/posts` Route Handler in `src/app/api/community/[courseSlug]/posts/route.ts` with cursor-based pagination and sort (recent/top)
- [x] T084 [US4] Implement `POST /api/community/[courseSlug]/posts` Route Handler in `src/app/api/community/[courseSlug]/posts/route.ts` for creating posts/replies (Pro only), triggering AI moderation
- [x] T085 [US4] Implement `POST /api/community/posts/[postId]/vote` Route Handler in `src/app/api/community/posts/[postId]/vote/route.ts` for toggle upvote (Pro only)
- [x] T086 [P] [US4] Create ForumPostCard component in `src/components/community/forum-post-card.tsx` with title, body preview, author, upvote count, reply count, vote button
- [x] T087 [P] [US4] Create ForumThread component in `src/components/community/forum-thread.tsx` with threaded replies, reply form, upvote interactions
- [x] T088 [US4] Build course community forum page in `src/app/(platform)/community/[courseSlug]/page.tsx` with post list, sort tabs, new post button (Pro only), free user read-only notice
- [x] T089 [US4] Build forum thread page in `src/app/(platform)/community/[courseSlug]/[postId]/page.tsx` with full thread, replies, and reply form
- [x] T090 [US4] Implement weekly digest email in `src/lib/email/templates/weekly-digest.tsx` and `src/app/api/cron/weekly-digest/route.ts` (Vercel Cron) aggregating top posts and new courses
- [x] T091 [US4] Configure Vercel Cron job in `vercel.json` for weekly digest (`0 9 * * 1` — Monday 9 AM)

**Checkpoint**: Community forums are functional with Q&A, voting, AI moderation, and weekly digest emails.

---

## Phase 7: User Story 5 — B2B Team License Purchase (Priority: P3)

**Goal**: Company admins self-serve purchase team licenses (5-50 seats), invite members by email, and view team progress on an admin dashboard.

**Independent Test**: Visit /teams → purchase 5-seat license → invite team members → verify members get Pro access → check admin dashboard shows team progress.

### Implementation for User Story 5

- [x] T092 Create Supabase migration for `team_licenses` and `team_members` tables in `src/supabase/migrations/012_teams.sql`
- [x] T093 Create RLS policies: team_licenses (admin of team), team_members (team admin + own row) in `src/supabase/migrations/013_rls_teams.sql`
- [x] T094 [P] [US5] Implement team data access in `src/lib/supabase/queries/teams.ts`: `createTeamLicense(data)`, `inviteTeamMember(licenseId, email)`, `getTeamMembers(licenseId)`, `getTeamProgress(licenseId)`, `removeTeamMember(memberId)`
- [x] T095 [US5] Implement `POST /api/teams/checkout` Route Handler in `src/app/api/teams/checkout/route.ts` creating Stripe Checkout for team license with volume pricing by seat count
- [x] T096 [US5] Implement `POST /api/teams/invite` Route Handler in `src/app/api/teams/invite/route.ts` for batch email invitations, sending invite emails via Resend
- [x] T097 [US5] Implement `GET /api/teams/dashboard` Route Handler in `src/app/api/teams/dashboard/route.ts` returning member list, completion rates, engagement metrics
- [x] T098 [US5] Implement `DELETE /api/teams/members/[memberId]` Route Handler in `src/app/api/teams/members/[memberId]/route.ts` for immediate seat removal
- [x] T099 [US5] Add team license webhook handling to `src/lib/stripe/webhooks.ts` for team subscription events (create, cancel, expire → update team_members)
- [x] T100 [P] [US5] Create team invite email template in `src/lib/email/templates/team-invite.tsx`
- [x] T101 [US5] Build teams marketing page in `src/app/(marketing)/teams/page.tsx` with seat count selector, volume pricing table, self-serve checkout
- [x] T102 [US5] Build team admin dashboard page in `src/app/(platform)/teams/page.tsx` with member list, invite form, progress tracking, exportable reports
- [x] T103 [US5] Implement team member invite acceptance flow: accept link in `src/app/(auth)/accept-invite/page.tsx` that activates Pro access for the team member

**Checkpoint**: B2B team licenses are functional with self-serve purchase, invitations, and admin analytics.

---

## Phase 8: User Story 6 — Referral Program (Priority: P3)

**Goal**: Pro users share unique referral links. When a referred user subscribes to Pro, both parties receive one free month.

**Independent Test**: Generate referral link as Pro user → new user signs up via link → new user subscribes to Pro → verify both parties receive free month credit.

### Implementation for User Story 6

- [x] T104 Create Supabase migration for `referrals` table in `src/supabase/migrations/014_referrals.sql`
- [x] T105 Create RLS policies for `referrals` (own rows as referrer read, server-only write) in `src/supabase/migrations/015_rls_referrals.sql`
- [x] T106 [P] [US6] Implement referral data access in `src/lib/supabase/queries/referrals.ts`: `createReferral(referrerId, refereeId)`, `completeReferral(referralId)`, `getReferralStats(userId)`
- [x] T107 [US6] Implement referral reward logic in `src/lib/stripe/referrals.ts`: apply one free month credit to both referrer and referee via Stripe credit balance or coupon
- [x] T108 [US6] Add referral tracking to signup flow: detect `ref` query parameter in `src/app/(auth)/register/page.tsx`, store `referred_by` on user creation
- [x] T109 [US6] Add referral completion trigger to Stripe webhook handler in `src/lib/stripe/webhooks.ts`: when referee's subscription activates, complete referral and apply rewards
- [x] T110 [US6] Build referral page in `src/app/(platform)/referral/page.tsx` showing unique referral link, copy button, referral count, and reward status

**Checkpoint**: Referral program is functional with tracked links, automatic rewards, and user-facing referral dashboard.

---

## Phase 9: Admin Panel (Cross-Story, Priority: P2)

**Goal**: Platform admin can manage content, users, revenue, moderation queue, and AI tutor logs.

- [x] T111 Build admin layout with navigation in `src/app/(admin)/layout.tsx` with role='admin' server-side check
- [x] T112 [P] Implement `GET /api/admin/dashboard` Route Handler in `src/app/api/admin/dashboard/route.ts` aggregating revenue, user counts, AI tutor usage, moderation queue count
- [x] T113 [P] Implement `GET /api/admin/moderation` and `POST /api/admin/moderation/[flagId]` Route Handlers in `src/app/api/admin/moderation/route.ts` and `src/app/api/admin/moderation/[flagId]/route.ts`
- [x] T114 [P] Implement `POST /api/admin/coupons` Route Handler in `src/app/api/admin/coupons/route.ts` for creating coupon codes with discount percentage and usage limits
- [x] T115 Build admin dashboard page in `src/app/(admin)/page.tsx` with revenue chart, user stats, quick actions
- [x] T116 Build admin moderation queue page in `src/app/(admin)/moderation/page.tsx` with flagged posts list, approve/remove actions
- [x] T117 Build admin coupon management page in `src/app/(admin)/coupons/page.tsx` with create form and usage tracking
- [x] T118 Build admin AI tutor logs page in `src/app/(admin)/ai-logs/page.tsx` for reviewing Q&A quality and off-topic detection
- [x] T146 [P] Implement admin course CRUD Route Handlers in `src/app/api/admin/courses/route.ts` and `src/app/api/admin/courses/[courseId]/route.ts` for creating, updating, and managing courses/modules/lessons
- [x] T147 Build admin content management page in `src/app/(admin)/content/page.tsx` with course list, create/edit forms for courses, modules, and lessons
- [x] T148 [P] Implement admin user management Route Handlers in `src/app/api/admin/users/route.ts` for listing users with filters (tier, role, country) and `src/app/api/admin/users/[userId]/route.ts` for viewing/editing user details and role changes
- [x] T149 Build admin user management page in `src/app/(admin)/users/page.tsx` with user list, search/filter, role editing, and subscription status overview

**Checkpoint**: Admin panel provides full platform management capabilities including content and user management.

---

## Phase 10: User Story 2 Supplement — AI Tutor (Priority: P1)

**Goal**: Pro users can ask the AI tutor French-language questions on each lesson page, grounded in lesson transcript context. Rate-limited per tier.

**Independent Test**: Open a lesson as Pro user → ask a question in French → receive contextual answer → ask off-topic question → get polite decline → verify free user sees 5/day limit.

### Implementation for AI Tutor

- [x] T119 Create Supabase migration for `ai_tutor_logs` table in `src/supabase/migrations/016_ai_tutor.sql`
- [x] T120 Create RLS policies for `ai_tutor_logs` (own rows read, server-only write) in `src/supabase/migrations/017_rls_ai_tutor.sql`
- [x] T121 [P] [US2] Implement rate limiting in `src/lib/redis/rate-limit.ts` using @upstash/ratelimit: free users 5/day, Pro users 30/hour
- [x] T122 [P] [US2] Implement Claude API client in `src/lib/ai-tutor/client.ts` with streaming support using @anthropic-ai/sdk
- [x] T123 [P] [US2] Implement AI tutor system prompt in `src/lib/ai-tutor/prompts.ts` with French-only constraint, lesson transcript injection, off-topic detection per contracts/ai-tutor-contract.md
- [x] T124 [US2] Implement `POST /api/ai-tutor` Route Handler in `src/app/api/ai-tutor/route.ts` with auth check, tier-based rate limiting, transcript context loading, Claude streaming SSE, off-topic detection, and logging to `ai_tutor_logs`
- [x] T125 [P] [US2] Create AiTutorChat client component in `src/components/ai-tutor/chat-sidebar.tsx` with message list, input field, streaming response display, rate limit indicator
- [x] T126 [US2] Integrate AI tutor sidebar into lesson page in `src/app/(platform)/courses/[courseSlug]/[lessonSlug]/page.tsx` as collapsible panel (Pro badge, paywall for free users)

**Checkpoint**: AI tutor is functional with French responses, topic constraints, rate limiting, and streaming UX.

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T128 [P] Add rate limiting middleware for all public API endpoints in `src/lib/redis/api-rate-limit.ts` using Upstash Redis
- [x] T129 [P] Implement French/English language toggle in `src/components/ui/language-toggle.tsx` and integrate into app layout
- [x] T130 [P] Add unsubscribe one-click link to all marketing emails per GDPR in `src/lib/email/templates/`
- [x] T131 Implement GDPR data export endpoint in `src/app/api/user/export/route.ts` returning user's personal data as JSON
- [x] T132 Implement GDPR account deletion endpoint in `src/app/api/user/delete/route.ts` performing soft delete per Constitution IV
- [x] T133 [P] Add responsive design and mobile optimization to all pages (course catalog, lesson page, dashboard)
- [x] T134 [P] Add keyboard navigation and ARIA labels to all interactive components per Constitution VII accessibility requirements
- [x] T135 [P] Create `robots.txt` and `sitemap.xml` generation in `src/app/robots.ts` and `src/app/sitemap.ts` for SEO
- [x] T136 Run quickstart.md validation: verify dev setup from scratch using the documented steps
- [x] T137 Security audit: verify all secrets are env-only, user content is sanitized before storage and escaped before render, signed URLs are enforced, RLS is complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — **BLOCKS all user stories**
- **US1 (Phase 3)**: Depends on Foundational — core content browsing
- **US2 (Phase 4)**: Depends on Foundational — can run in parallel with US1 after Phase 2
- **AI Tutor (Phase 10)**: Depends on US2 (subscription tier check) + US1 (lesson pages exist)
- **US3 (Phase 5)**: Depends on US1 (course/lesson pages) + US2 (Pro tier gating)
- **US4 (Phase 6)**: Depends on US1 (course pages) + US2 (Pro tier gating)
- **US5 (Phase 7)**: Depends on US2 (Stripe infrastructure)
- **US6 (Phase 8)**: Depends on US2 (subscription/Stripe infrastructure)
- **Admin (Phase 9)**: Depends on US2 + US4 (moderation, AI logs, revenue data)
- **Polish (Phase 11)**: Depends on all desired user stories being complete

### User Story Dependencies

```
Phase 1 (Setup) ──→ Phase 2 (Foundational) ──┬──→ Phase 3 (US1: Browse/Watch) ──┬──→ Phase 5 (US3: Certs)
                                              │                                   ├──→ Phase 6 (US4: Community)
                                              │                                   └──→ Phase 10 (AI Tutor)
                                              │
                                              └──→ Phase 4 (US2: Pro/Stripe) ─────┬──→ Phase 5 (US3: Certs)
                                                                                   ├──→ Phase 6 (US4: Community)
                                                                                   ├──→ Phase 7 (US5: Teams)
                                                                                   ├──→ Phase 8 (US6: Referrals)
                                                                                   ├──→ Phase 9 (Admin)
                                                                                   └──→ Phase 10 (AI Tutor)
```

### Within Each User Story

- Migrations before RLS policies
- RLS policies before data access functions
- Data access functions before Route Handlers
- Route Handlers before UI pages
- Components (marked [P]) can be built in parallel with data access and routes
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] (T004, T005, T006, T008, T009) can run in parallel
- All Foundational tasks marked [P] (T014, T015, T017, T018, T019, T021, T022) can run in parallel
- US1 and US2 can start in parallel after Foundational completes
- Within US1: T025, T026, T027 can run in parallel; T033, T034, T037, T038 can run in parallel
- Within US2: T048, T049, T050 can run in parallel; T055, T056, T057 can run in parallel
- US3 and US4 can start in parallel once US1 + US2 are complete
- US5 and US6 can start in parallel once US2 is complete
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch data access + video signing in parallel:
Task T025: "Course queries in src/lib/supabase/queries/courses.ts"
Task T026: "Progress queries in src/lib/supabase/queries/progress.ts"
Task T027: "Bunny.net signed URLs in src/lib/bunny/signed-urls.ts"

# Launch UI components in parallel:
Task T033: "CourseCard in src/components/course/course-card.tsx"
Task T034: "CourseProgressBar in src/components/course/progress-bar.tsx"
Task T037: "VideoPlayer in src/components/video/video-player.tsx"
Task T038: "TranscriptViewer in src/components/video/transcript-viewer.tsx"
```

## Parallel Example: User Story 2

```bash
# Launch service layer in parallel:
Task T048: "PPP pricing logic in src/lib/stripe/pricing.ts"
Task T049: "Stripe client in src/lib/stripe/client.ts"
Task T050: "Subscription queries in src/lib/supabase/queries/subscriptions.ts"

# Launch UI + email in parallel:
Task T055: "PaywallPrompt in src/components/ui/paywall-prompt.tsx"
Task T056: "Email templates in src/lib/email/templates/"
Task T057: "Email send functions in src/lib/email/send.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Browse & Watch)
4. **STOP and VALIDATE**: Browse catalog, watch a video, track progress
5. Deploy to Vercel — this is a usable product (free course platform)

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. US1 (Browse/Watch) → Deploy → **MVP: free course platform**
3. US2 (Pro/Stripe) + AI Tutor → Deploy → **Monetized platform with AI tutor**
4. US3 (Labs/Certs) → Deploy → **Full learning experience**
5. US4 (Community) → Deploy → **Social learning**
6. US5 (Teams) + US6 (Referrals) → Deploy → **Growth channels**
7. Admin Panel → Deploy → **Full management**
8. Polish → Deploy → **Production-ready**

### Solo Developer Strategy

Since this is a solo-developer project:

1. Work sequentially through phases in priority order
2. Within each phase, batch [P] tasks for efficient context-switching
3. Commit after each task or logical group
4. Stop at any checkpoint to validate independently
5. Deploy early and often — each phase is a deployable increment

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable at its checkpoint
- Commit after each task or logical group
- Stop at any checkpoint to validate the story independently
- The `subscription_status()` SQL function is in Phase 2 (T013b) so all Pro-gated RLS policies can reference it
