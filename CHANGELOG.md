# Changelog

All notable changes to IAlgeria will be documented in this file.

## [0.1.0.0] - 2026-04-03

### Added
- Browse and watch free course videos with Bunny.net CDN and signed URLs
- Stripe subscription payments with 7-day free trial and PPP pricing (Maghreb, West Africa, Canada)
- AI tutor powered by Claude with streaming responses, rate limiting (5/day free, 30/hr pro)
- Interactive code labs with Judge0 execution (Python, JavaScript, R)
- Capstone project submissions with AI grading and peer review
- Course completion certificates with PDF generation and public verification
- Community Q&A forums with AI content moderation
- B2B team licenses with admin dashboard and seat management
- Referral program with region-aware Stripe balance credits
- Weekly digest emails via Resend with one-click unsubscribe (RFC 8058)
- Admin dashboard with user management, content admin, coupon management, and moderation
- Supabase RLS policies across all 22 tables with subscription-gated access
- API rate limiting via Upstash Redis (3 tiers: general, mutation, auth)
- Responsive design with mobile-first Tailwind CSS and accessibility (ARIA, focus-visible)
- Full deployment guide (DEPLOY.md) covering all 8 external services

### Fixed
- Unsubscribe, weekly digest, AI tutor logging, and admin routes now use service-role Supabase client (RLS was silently blocking operations)
- Account deletion now cancels Stripe subscriptions and uses is_removed for post anonymization (NOT NULL constraint)
- Users RLS policy prevents self-promotion to admin role
- West Africa pricing uses regional Stripe prices instead of default 19 EUR
- Referral rewards are region-aware (correct amount and currency per user)
- Coupon usage incremented in webhook after payment, not before checkout session
- increment_coupon_usage SQL function has SECURITY DEFINER and expiry check
- Stripe webhook returns 500 for retryable errors (enables Stripe retry)
- Content moderation uses XML-delimited user content to prevent prompt injection
- Capstone grading uses atomic status lock and resets on API failure
- Webhook and checkout routes no longer leak internal error messages
- AI tutor client sends correct field names (lesson_id, session_messages)
- Route conflict between marketing and platform /teams pages resolved
- Cron secret uses timing-safe comparison
