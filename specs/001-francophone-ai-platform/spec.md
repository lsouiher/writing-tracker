# Feature Specification: Francophone AI Learning Platform

**Feature Branch**: `001-francophone-ai-platform`  
**Created**: 2026-04-01  
**Status**: Draft  
**Input**: User description: "Plateforme Francophone d'Apprentissage IA — free course videos + paid Pro tier with labs, AI tutor, certificates, community, PPP pricing for Maghreb"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse and Watch Free Course Videos (Priority: P1)

A visitor discovers the platform through a French-language search or referral. They browse the course catalog, filter by level, and watch free preview lessons without creating an account. When they want to track their progress, they create a free account and continue watching full course videos at their own pace. Progress is tracked per lesson and displayed on their dashboard.

**Why this priority**: Free video content is the core audience-building engine. Without discoverable, accessible content, no users enter the funnel. This is the foundation for all other features.

**Independent Test**: Can be fully tested by visiting the platform, browsing the catalog, watching a preview lesson without login, creating an account, and verifying that lesson progress is tracked on the dashboard.

**Acceptance Scenarios**:

1. **Given** a visitor is not logged in, **When** they browse the course catalog, **Then** they can see all courses with titles, descriptions, levels, and durations
2. **Given** a visitor is not logged in, **When** they open any course, **Then** they can watch the first lesson of each module without creating an account
3. **Given** a registered free user is logged in, **When** they watch a lesson to completion, **Then** their progress is saved and reflected on their dashboard
4. **Given** a free user visits their dashboard, **When** they view their courses, **Then** they see per-lesson completion status, module progress bars, and overall course percentage

---

### User Story 2 - Free-to-Pro Conversion via Trial (Priority: P1)

A free user who has been watching videos encounters locked features (labs, quizzes, certificates, AI tutor). They are prompted to start a 7-day free trial of the Pro tier. They provide a payment method and gain full access. During the trial, they complete a lab, ask the AI tutor a question, and take a quiz. At the end of the trial, their subscription auto-converts to paid unless cancelled. Regional pricing is automatically applied based on their location.

**Why this priority**: Revenue generation is essential for platform sustainability. The free-to-Pro funnel is the primary business model. Without conversion mechanics, the platform cannot sustain itself.

**Independent Test**: Can be tested by creating a free account, encountering a paywall prompt, starting a trial, accessing Pro features (lab, AI tutor, quiz), and verifying auto-conversion after 7 days.

**Acceptance Scenarios**:

1. **Given** a free user views a locked feature (lab, quiz, certificate), **When** they click on it, **Then** they see a clear prompt to start a 7-day free Pro trial
2. **Given** a user starts a free trial, **When** they provide a payment method, **Then** they gain immediate access to all Pro features
3. **Given** a trial user is located in Algeria, **When** they view pricing, **Then** the PPP-adjusted price (~DZD 500/mo) is displayed instead of the standard EUR price
4. **Given** a trial user has not cancelled, **When** the 7-day trial expires, **Then** their subscription auto-converts to a paid Pro plan at the appropriate regional price
5. **Given** a Pro subscriber, **When** they access the AI tutor on a lesson page, **Then** they can ask questions in French and receive contextual answers based on the lesson transcript

---

### User Story 3 - Complete a Course and Earn a Certificate (Priority: P2)

A Pro user follows a structured learning path through a course. They watch video lessons, complete interactive labs in a browser-based coding environment, pass module quizzes, and submit a capstone project. Upon completing all requirements, they receive a verifiable certificate (branded PDF with a unique verification URL) that they can share on LinkedIn.

**Why this priority**: Certificates are the primary value differentiator for Pro users and a key conversion driver. They provide tangible proof of learning that justifies the subscription cost.

**Independent Test**: Can be tested by enrolling in a course as a Pro user, completing all lessons, labs, quizzes, and the capstone, then verifying that a certificate is generated with a working verification URL.

**Acceptance Scenarios**:

1. **Given** a Pro user is enrolled in a course, **When** they open a lab exercise, **Then** a browser-based coding environment loads with pre-configured settings for that exercise
2. **Given** a Pro user completes a module, **When** they take the module quiz, **Then** they receive instant auto-graded feedback in French
3. **Given** a Pro user has completed all lessons, labs, quizzes, and the capstone for a course, **When** they visit their dashboard, **Then** a certificate is available for download as a branded PDF
4. **Given** anyone has a certificate verification URL, **When** they visit that URL, **Then** they see the certificate holder's name, course title, and completion date

---

### User Story 4 - Participate in the Community (Priority: P2)

A Pro user posts a question on a course-specific Q&A forum, receives replies from other learners, and upvotes helpful answers. Free users can read all forum posts but cannot post or reply. A weekly digest email summarizes top posts and new courses for all registered users. AI-assisted moderation flags inappropriate content for manual review.

**Why this priority**: Community engagement increases retention and reduces support burden through peer learning. Read access for free users serves as an additional conversion lever.

**Independent Test**: Can be tested by posting a question as a Pro user, replying as another Pro user, verifying a free user can read but not post, and confirming the weekly digest email is sent.

**Acceptance Scenarios**:

1. **Given** a Pro user is on a course page, **When** they navigate to the Q&A forum, **Then** they can post questions, reply to threads, and upvote posts
2. **Given** a free user visits a course forum, **When** they try to post or reply, **Then** they see a message indicating that posting requires a Pro subscription
3. **Given** a registered user, **When** a new weekly digest is generated, **Then** they receive an email summarizing top community posts and new course announcements
4. **Given** a user posts content that is flagged by moderation, **When** a moderator reviews the queue, **Then** they can approve or remove the flagged content

---

### User Story 5 - B2B Team License Purchase (Priority: P3)

A company CTO visits the teams page, reviews pricing for bulk seats (5-50 seats at a volume discount), and self-serves a purchase via the payment system. They then invite team members by email. Each member receives Pro access. The admin dashboard shows team-wide progress tracking and completion reports.

**Why this priority**: B2B revenue is a growth multiplier but is not needed for initial launch. It builds on existing Pro infrastructure and adds an admin management layer.

**Independent Test**: Can be tested by visiting the teams page, purchasing a 5-seat license, inviting team members, verifying they get Pro access, and confirming the admin dashboard shows team progress.

**Acceptance Scenarios**:

1. **Given** a visitor is on the /teams page, **When** they select a seat count and proceed to checkout, **Then** they can complete the purchase without contacting sales
2. **Given** a team admin has purchased seats, **When** they invite team members by email, **Then** each invited member receives Pro-level access upon accepting
3. **Given** a team admin is on the admin dashboard, **When** they view team analytics, **Then** they see completion rates, engagement metrics, and exportable reports per team member

---

### User Story 6 - Referral Program (Priority: P3)

A Pro user shares a unique referral link with a friend. When the friend signs up and subscribes to Pro, both the referrer and the new user receive one free month of Pro access. Referrals are tracked via unique links.

**Why this priority**: Referrals are a low-cost acquisition channel but depend on having an established user base first.

**Independent Test**: Can be tested by generating a referral link, having a new user sign up through it, and verifying both parties receive the free month credit.

**Acceptance Scenarios**:

1. **Given** a Pro user, **When** they access the referral section, **Then** they see a unique referral link they can share
2. **Given** a new user signs up via a referral link and subscribes to Pro, **When** their subscription is confirmed, **Then** both the referrer and the new user receive one free month of Pro

---

### Edge Cases

- What happens when a user's payment fails during trial-to-paid conversion? The system retries payment up to 3 times over a 7-day grace period, notifies the user at each attempt, and downgrades to free tier if all retries fail
- What happens when a user accesses the platform from a country not in the PPP pricing table? Standard EUR pricing is applied as the default
- What happens when the AI tutor receives an off-topic question? It responds gracefully in French, declining the query and suggesting relevant course content
- What happens when a team admin removes a member mid-billing-cycle? The member loses Pro access immediately; the seat becomes available for reassignment
- What happens when a free user tries to access a lab or quiz directly via URL? They are redirected to a paywall/trial prompt

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow visitors to browse the full course catalog (titles, descriptions, levels, durations) without authentication
- **FR-002**: System MUST allow visitors to watch the first lesson of each module without creating an account
- **FR-003**: System MUST support user registration via email and Google OAuth, with French as the default UI language
- **FR-004**: System MUST track per-lesson completion and display module progress bars and overall course percentage on the user dashboard
- **FR-005**: System MUST provide an embedded video player with chapter navigation, adjustable playback speed (0.5x-2x), quality selection, and auto-resume from last position. Video URLs MUST be signed with expiry to prevent unauthorized direct access
- **FR-006**: System MUST display synchronized French transcripts alongside video with click-to-seek functionality
- **FR-007**: System MUST support two subscription tiers: Free (video access, read-only community, basic progress) and Pro (labs, quizzes, AI tutor, certificates, full community). Personalized learning paths are deferred to a future phase
- **FR-008**: System MUST offer a 7-day free trial for the Pro tier, collecting a payment method upfront, with automatic conversion to paid at trial end. Upon cancellation, Pro access is retained until the end of the current paid billing period
- **FR-009**: System MUST auto-detect user country and apply purchasing-power-parity pricing for supported regions (Algeria, Morocco, Tunisia, West Africa, Canada)
- **FR-010**: System MUST support monthly and annual Pro subscription billing in EUR, CAD, and USD. System MUST support admin-created coupon codes with configurable discount percentage and usage limits for promotional pricing
- **FR-011**: System MUST provide an AI-powered tutor sidebar on each lesson page (Pro only) that answers questions in French using the lesson transcript and module context
- **FR-012**: System MUST meter AI tutor usage: free users get 5 questions per day; Pro users get unlimited access with burst protection (30 questions per hour)
- **FR-013**: System MUST constrain the AI tutor to course-related topics only, gracefully declining off-topic queries
- **FR-014**: System MUST provide browser-based interactive coding labs (Pro only) with pre-configured environments and persisted student code
- **FR-015**: System MUST support auto-graded quizzes (multiple choice + short answer) after each module with instant feedback in French. A minimum score of 70% is required to pass, with unlimited retakes permitted
- **FR-016**: System MUST support capstone projects per course with AI-graded rubrics and optional community peer review
- **FR-017**: System MUST auto-generate verifiable certificates of completion as branded PDFs with unique verification URLs
- **FR-018**: System MUST provide per-course Q&A forums where free users can read and Pro users can post, reply, and upvote
- **FR-019**: System MUST send a weekly digest email to all registered users summarizing top posts, new courses, and AI news
- **FR-020**: System MUST provide AI-assisted content moderation that flags posts for a manual review queue
- **FR-021**: System MUST support self-serve B2B team licenses (5-50 seats) with volume pricing, bulk enrollment, and an admin dashboard showing team progress
- **FR-022**: System MUST provide a referral system where both referrer and referee receive one free month of Pro when the referee subscribes
- **FR-023**: System MUST include an admin panel for content management, user management, revenue dashboard, and AI tutor log review
- **FR-024**: System MUST implement French SEO meta tags, Open Graph tags, and structured data (Course schema) for search engine visibility
- **FR-025**: System MUST provide privacy-friendly, GDPR-compliant analytics with funnel tracking
- **FR-026**: System MUST support French and English subtitles on all videos

### Key Entities

- **User**: A person who registers on the platform. Has a subscription tier (free or Pro), country, language preference, and learning progress. Can be a student, team admin, or platform admin
- **Course**: A structured learning program with a title, description, level (beginner/intermediate/advanced), and a collection of modules. All video content is free to watch
- **Module**: A thematic grouping within a course, containing ordered lessons, a quiz, and potentially a lab exercise
- **Lesson**: A single learning unit with a video, synchronized transcript, and optional free preview status. The atomic unit of progress tracking
- **Subscription**: A user's billing relationship, including plan type (monthly/annual), payment status, regional pricing tier, and trial state
- **Certificate**: A verifiable credential issued upon course completion, containing a unique verification code and downloadable PDF
- **Lab**: A browser-based interactive coding exercise tied to a lesson or module, with persisted student work
- **Quiz**: An auto-graded assessment (MCQ + short answer) tied to a module, with score tracking and French-language feedback
- **Community Post**: A forum entry tied to a course, authored by a Pro user, with threading (parent/child), upvotes, and moderation flags
- **Team License**: A B2B arrangement linking an admin user to a set of seats, each providing Pro access to a team member
- **Referral**: A tracked invitation linking a referrer to a referee, with reward logic for both parties upon Pro subscription

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 5,000 registered free-tier users within 6 months of public launch
- **SC-002**: 5-10% of active free users convert to Pro subscribers within the first year
- **SC-003**: Monthly recurring revenue reaches at least EUR 2,000 by month 6
- **SC-004**: More than 40% of enrolled Pro users complete their enrolled courses
- **SC-005**: AI tutor satisfaction rating averages above 4.0 out of 5.0
- **SC-006**: More than 20% of Pro users participate in community forums weekly by month 3
- **SC-007**: Platform ranks in the top 3 organic search results for "formation IA francais" within 6 months
- **SC-008**: Monthly Pro subscription churn rate stays below 8%
- **SC-009**: Net Promoter Score exceeds 50 in quarterly surveys
- **SC-010**: Users can complete account creation and watch their first lesson within 3 minutes
- **SC-011**: Free preview lessons load and begin playing within 3 seconds for users worldwide
- **SC-012**: AI tutor responds to questions within 5 seconds

## Assumptions

- Users have stable internet connectivity sufficient for streaming video content
- The platform targets French-speaking professionals, students, and developers primarily in France, Canada (Quebec), and the Maghreb region (Algeria, Morocco, Tunisia)
- A solo developer will build and maintain the platform, so the architecture must minimize operational complexity
- All course content is pre-recorded (no live sessions) and produced by a single creator initially, with guest instructors joining in later phases
- Standard session-based or OAuth2 authentication is sufficient for user security needs
- IP-based geolocation is accurate enough for initial PPP pricing detection, refined by billing address at checkout
- The free tier has no time limit — users can watch all videos indefinitely without paying
- Mobile native app and offline mode are out of scope for V1 (deferred to Phase 5)
- Local payment methods (BaridiMob, Flouci) are out of scope for V1 (deferred to Phase 5)
- Live sessions, webinars, and synchronous teaching are out of scope for V1
- Multi-language UI beyond French and English is out of scope for V1
- White-label or corporate training portals are out of scope for V1

## Clarifications

### Session 2026-04-01

- Q: What score constitutes passing a quiz for certificate eligibility? → A: 70% minimum score to pass, unlimited retakes
- Q: When a Pro user cancels, do they keep access until the billing period ends? → A: Yes, retain Pro access until end of current paid billing period
- Q: How long is the grace period for failed payments? → A: 7-day grace period with 3 retry attempts before downgrade to free tier
- Q: Should videos be DRM-protected or use lighter protection? → A: Signed URLs with expiry (time-limited access links, no direct file access)
- Q: Should early-bird pricing (50% off for first 100 subscribers) be automated or manual? → A: Manual coupon codes with a 100-redemption usage limit, created by admin
