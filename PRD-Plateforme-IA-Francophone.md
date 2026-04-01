# Product Requirements Document — Plateforme Francophone d'Apprentissage IA

**Version:** 1.0 · **Date:** March 31, 2026 · **Status:** Draft · **Confidentiality:** Internal

---

## 1. Executive Summary

This PRD defines the requirements for a Francophone AI learning platform modeled on the DeepLearning.AI approach: free course video content to build a large audience, with a paid Pro tier that unlocks hands-on labs, certificates, an AI tutor, and community features. The platform targets French-speaking professionals, students, and developers across France, Canada (Québec), and the Maghreb region (Algeria, Morocco, Tunisia).

The platform will be the first dedicated AI education product built entirely in French, with purchasing-power-parity pricing for North African markets and a technical stack designed for a solo developer to build and maintain.

---

## 2. Vision & Strategic Goals

### 2.1 Vision

> Become the reference platform for AI education in the Francophone world — the "DeepLearning.AI en français" — by combining world-class pre-recorded content with an intelligent, AI-powered learning experience.

### 2.2 Strategic Goals

| ID | Goal | Target |
|---|---|---|
| G1 | Audience Growth | Reach 5,000 registered free-tier users within 6 months of public launch |
| G2 | Revenue | Convert 5–10% of active users to Pro subscribers within the first year |
| G3 | Content Depth | Ship 3 course tiers (Beginner, Intermediate, Advanced) within 12 months |
| G4 | Market Position | Become the top-ranked French-language AI learning platform in organic search |
| G5 | Sustainability | Reach break-even (€2,000/mo) within 6 months; €10K+/mo within 18 months |

---

## 3. Target Users & Personas

### Karim, 28 — Junior Developer, Algiers
Wants to add AI skills to land remote freelance contracts. Price-sensitive. Mobile-first. Needs content in French with Maghreb-relevant examples.

### Sophie, 35 — Marketing Manager, Paris
Non-technical. Needs to understand AI tools for her team. Values certificates she can show her employer. Willing to pay €30/mo if ROI is clear.

### Marc, 42 — CTO, Montréal
Evaluating AI training for his 15-person engineering team. Needs B2B team licenses, structured learning paths, and completion tracking.

### Émilie, 22 — CS Student, Casablanca
Learning AI fundamentals alongside university studies. Wants free content plus affordable access to labs and certificates.

---

## 4. Competitive Analysis

| Platform | Model | Strengths | Gaps |
|---|---|---|---|
| DeepLearning.AI | Free videos + Pro ($30/mo) | 150+ courses, Andrew Ng brand, labs & certs | English-only, no PPP pricing |
| Coursera | Free audit / paid certs | University partnerships, global brand | French content limited, expensive certs |
| OpenClassrooms | Free + Premium (€20/mo) | French-native, diploma programs | Broad tech, not AI-specialized |
| **Our Platform** | **Free videos + Pro (€19–39/mo)** | **French-first, AI-focused, PPP, AI tutor** | **New entrant, single creator initially** |

---

## 5. Freemium Model Design

Following the DeepLearning.AI model, all course videos are free to watch. The Pro tier monetizes hands-on learning, certification, and advanced tooling.

### 5.1 Free Tier (Gratuit)

- Watch all course videos (unlimited, no paywall on video content)
- Browse course catalogs, module outlines, and learning paths
- Preview the first lesson of every module without an account
- Access to public community forums (read-only)
- Basic progress tracking (lessons watched)
- Weekly AI newsletter (Le Bulletin IA)
- Congratulatory email on course video completion (no formal certificate)

### 5.2 Pro Tier (€19/mo or €190/yr)

Everything in Free, plus:

- Interactive coding labs with live environments for every course
- Quizzes, graded assignments, and capstone projects
- AI Tutor sidebar on every lesson page (Claude API, answers in French)
- Verifiable certificates of completion (branded PDF, LinkedIn-shareable)
- Full community access: post questions, reply, upvote, peer review
- Personalized learning paths and skill assessments
- Save progress, bookmarks, and notes across devices
- Priority access to new courses and features
- Portfolio projects with AI-graded rubrics

### 5.3 Regional Pricing (PPP)

Purchasing-power-parity pricing is auto-applied based on IP geolocation:

| Region | Pro Price | Notes |
|---|---|---|
| France / EU | €19/mo — €190/yr | Standard pricing |
| Canada (Québec) | CAD $25/mo — CAD $250/yr | Currency-adjusted |
| Algeria | DZD 500/mo (~€3.50) | ~80% discount via PPP |
| Morocco / Tunisia | MAD 50/mo (~€4.50) | ~75% discount via PPP |
| West Africa (CFA) | CFA 2,500/mo (~€3.80) | ~80% discount via PPP |

### 5.4 B2B Team Licenses

Self-serve portal for companies. No sales calls required.

- 5–50 seats: €15/seat/mo (volume discount)
- Admin dashboard with team progress tracking and completion reports
- Bulk enrollment, user management, and exportable analytics
- Priority support via email

---

## 6. Feature Requirements

### 6.1 Course Delivery Engine

| ID | Feature | Description | Priority |
|---|---|---|---|
| F-01 | Video Player | Embedded player with chapters, adjustable speed (0.5x–2x), quality selection, auto-resume | Must |
| F-02 | Progress Tracking | Per-lesson completion, module progress bars, overall course percentage on dashboard | Must |
| F-03 | Transcript Display | Synced French transcripts alongside video with click-to-seek. Fed to AI Tutor | Must |
| F-04 | Free Preview | First lesson of each module accessible without login. Rest requires free account | Must |
| F-05 | Captions | French + English subtitles on all videos. Optional Arabic for Maghreb courses | Should |
| F-06 | Offline Mode | Download lessons for offline viewing in mobile app (Phase 5) | Could |

### 6.2 AI Tutor (Pro Only)

| ID | Feature | Description | Priority |
|---|---|---|---|
| F-07 | Lesson-Context Chat | Sidebar chat per lesson. AI has transcript + module context. French by default | Must |
| F-08 | Multi-Turn Memory | Retains conversation context within a session for follow-up questions | Must |
| F-09 | Code Assistance | Reviews student code, suggests fixes, explains errors in French | Should |
| F-10 | Usage Metering | Track tokens per user/month. Free: 5 questions/day. Pro: unlimited | Must |
| F-11 | Guardrails | Stays on-topic (course content only). Refuses off-topic queries gracefully | Must |

### 6.3 Labs, Quizzes & Certification (Pro Only)

| ID | Feature | Description | Priority |
|---|---|---|---|
| F-12 | Interactive Labs | Browser-based coding environments. Pre-configured. Student code persisted | Must |
| F-13 | Quizzes | MCQ + short-answer after each module. Auto-graded. Instant feedback in French | Must |
| F-14 | Capstone Projects | One per course. AI-graded with rubric. Community peer review | Must |
| F-15 | Certificates | Auto-generated branded PDF. Unique verification URL. LinkedIn-shareable | Must |
| F-16 | Portfolio Page | Public profile showing completed courses, certificates, and capstones | Should |

### 6.4 Community (Read: Free / Write: Pro)

| ID | Feature | Description | Priority |
|---|---|---|---|
| F-17 | Course Forums | Per-course Q&A board. Free: read-only. Pro: post, reply, upvote | Must |
| F-18 | Peer Review | Capstone submissions for community feedback. Structured templates | Should |
| F-19 | Weekly Digest | Email summary of top posts, new courses, and AI news. All users | Must |
| F-20 | Moderation | AI-assisted moderation flagging. Manual review queue | Must |

### 6.5 Payments & Subscriptions

| ID | Feature | Description | Priority |
|---|---|---|---|
| F-21 | Stripe Integration | Monthly + annual Pro subs. EUR, CAD, USD. SCA-compliant for EU | Must |
| F-22 | PPP Auto-Pricing | Detect country via IP + billing address. Auto-apply regional discount | Must |
| F-23 | Free Trial | 7-day trial with full access. Payment method upfront. Auto-converts | Must |
| F-24 | B2B Self-Serve | Team license portal: bulk seats, admin dashboard, usage reports | Should |
| F-25 | Local Payments | BaridiMob/CCP (Algeria), Flouci (Tunisia) — Phase 5 | Could |

### 6.6 Platform & Infrastructure

| ID | Feature | Description | Priority |
|---|---|---|---|
| F-26 | Auth System | Email + Google OAuth. French-first UI with language toggle. Password reset | Must |
| F-27 | Student Dashboard | My courses, progress bars, next lesson, bookmarks, certificate gallery | Must |
| F-28 | Course Catalog | Browse by level, topic, duration. Search. Filter by free preview | Must |
| F-29 | SEO | French meta tags, Open Graph, Course schema for Google rich results | Must |
| F-30 | Analytics | Privacy-friendly (Plausible/PostHog). GDPR-compliant. Funnel tracking | Must |
| F-31 | Referral System | Invite a friend, both get 1 month free Pro. Tracked via unique links | Should |
| F-32 | Admin Panel | Content mgmt, user mgmt, revenue dashboard, AI tutor log review | Must |

---

## 7. Technical Architecture

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Next.js 14+ (App Router) + Tailwind + TypeScript | SSR for SEO, fast loads, React ecosystem |
| Auth & DB | Supabase (Postgres + Auth + Storage + Realtime) | Free tier generous, RLS, real-time |
| Video | Bunny.net Stream | $1/1K views, DRM, adaptive bitrate, global CDN |
| Payments | Stripe | Subscriptions + one-time, SCA, multi-currency |
| AI Tutor | Claude API (Sonnet) | Fast, affordable, excellent French. ~$0.003/question |
| Email | Resend | Transactional + marketing. Free tier to start |
| Hosting | Vercel | Free tier, auto-scaling, edge functions |
| Analytics | Plausible or PostHog | Privacy-friendly, GDPR-compliant |
| Labs | Gitpod or custom Docker | Browser-based coding, pre-configured per course |

### 7.1 Database Schema (Key Tables)

| Table | Key Fields |
|---|---|
| users | id, email, name, country, language_pref, subscription_tier, stripe_customer_id, created_at |
| courses | id, title, description, level, price_eur, price_ppp, thumbnail_url, is_published |
| modules | id, course_id, title, order, description |
| lessons | id, module_id, title, video_url, transcript, duration_min, order, is_free_preview |
| progress | user_id, lesson_id, completed, last_position_sec, completed_at |
| enrollments | user_id, course_id, purchased_at, payment_id, price_paid, access_type |
| subscriptions | user_id, stripe_sub_id, plan, status, current_period_end, ppp_region |
| community_posts | id, course_id, user_id, title, body, parent_id, upvotes, is_flagged, created_at |
| certificates | id, user_id, course_id, issued_at, verification_code, pdf_url |
| quiz_results | id, user_id, module_id, score, answers_json, attempted_at |
| ai_tutor_logs | id, user_id, lesson_id, question, response, tokens_used, created_at |
| team_licenses | id, company_name, admin_user_id, seat_count, stripe_sub_id, created_at |

### 7.2 Estimated Monthly Costs

| Phase | Vercel | Supabase | Bunny | Stripe | Claude | Total |
|---|---|---|---|---|---|---|
| Launch (0–100 users) | Free | Free | ~$5 | % only | ~$5 | $0–20/mo |
| Growth (100–1K) | $20 | $25 | ~$50 | % only | ~$50 | $150–300/mo |
| Scale (1K–5K) | $20 | $75 | ~$200 | % only | ~$200 | $500–800/mo |

---

## 8. Course Content Plan

Three tiers, all in French. Content is recorded once, sold indefinitely.

### 8.1 Course 1: Débutant — «Les Fondamentaux de l'IA pour le Business»

*12 lessons • ~8 hours • 6 modules • Record in 3 weekends*

- Module 1: Comprendre l'IA (2 lessons, 90 min)
- Module 2: Maîtriser le Prompting (2 lessons, 90 min)
- Module 3: Outils IA pour le Business (3 lessons, 2 hrs)
- Module 4: Automatiser les Tâches (2 lessons, 90 min)
- Module 5: IA pour le Marketing (2 lessons, 90 min)
- Module 6: Projet Final (1 lesson + capstone)

### 8.2 Course 2: Intermédiaire — «Implémenter l'IA dans votre Entreprise»

*16 lessons • ~12 hours • 8 modules • Record months 2–3*

Modules: Audit IA, Chatbots, No-Code AI Apps, Données & Décisions, Agents IA, Gérer l'IA en Équipe, Vendre des Services IA, Capstone

### 8.3 Course 3: Avancé — «Bâtir un Business propulsé par l'IA»

*20 lessons • ~15 hours • 10 modules • Record months 4–6*

Modules: Architecture Produit IA, Full-Stack IA, Agents Autonomes, IA & SaaS, Entreprendre depuis l'Afrique du Nord, Capstone

---

## 9. Key User Journeys

### 9.1 Free User Journey

1. Discovers platform via French SEO article or community referral
2. Browses catalog, watches free preview lessons without account
3. Creates free account (email or Google) to track progress
4. Watches full course videos. Sees locked lab/quiz/certificate badges
5. Receives weekly newsletter with AI tips and new course announcements
6. Hits friction point: wants to try a lab or earn a certificate
7. Prompted to start 7-day free Pro trial

### 9.2 Free → Pro Conversion

1. Starts 7-day free trial (payment method collected upfront)
2. Full access: labs, quizzes, AI tutor, community posting, certificates
3. Completes first module quiz + lab. Progress reflected on dashboard
4. Asks AI tutor a question. Gets instant answer in French
5. Receives "3 days left" email with progress summary
6. Trial converts to paid subscription. Continues learning path

### 9.3 B2B Team Journey

1. CTO visits /teams page, sees pricing and features
2. Self-serve purchase: selects seat count, pays via Stripe
3. Invites team via email. Each member gets Pro access
4. Admin dashboard shows team completion rates and engagement

---

## 10. Go-to-Market & Launch Strategy

### 10.1 Pre-Launch (Weeks 1–4)

- Landing page with waitlist email capture
- 4–6 long-form French SEO articles ("Comment utiliser l'IA pour...")
- 3–4 LinkedIn posts in French about AI insights, linking to platform

### 10.2 Launch Channels

| Channel | Approach | Effort |
|---|---|---|
| SEO (French) | Long-form blog posts. Low competition in French AI content | One-time, compounds |
| Forums | Algerian FB groups, Grafikart, OpenClassrooms, Reddit | 2 hrs total |
| Product Hunt | "First AI platform for Francophone professionals" | 2 hrs one-time |
| Universities | Email 10–20 Maghreb CS departments — free access | 2 hrs one-time |
| Diaspora | Maghreb professional associations in FR, CA | 2 hrs one-time |
| Referral | Built-in: invite friend, both get 1 month free Pro | Built once |

### 10.3 Launch Pricing Tactics

- Early-bird: first 100 Pro subscribers get 50% off first 3 months
- Freemium hook: Module 1 fully free (no account needed for preview)
- Annual plan: 2 months free vs. monthly
- 7-day free trial for Pro tier with full access

---

## 11. Success Metrics & KPIs

| Metric | Target | Timeframe |
|---|---|---|
| Registered Users | 5,000 free accounts | 6 months |
| Pro Conversion Rate | 5–10% of active free users | Ongoing |
| MRR | €2,000+ | Month 6 |
| Course Completion | >40% for enrolled Pro users | Ongoing |
| AI Tutor Satisfaction | >4.0/5.0 rating | Ongoing |
| Community Engagement | >20% Pro users post weekly | Month 3+ |
| Organic Traffic | Top 3 for "formation IA français" | Month 6 |
| Churn Rate | <8% monthly for Pro | Ongoing |
| NPS | >50 | Quarterly |

---

## 12. Phased Delivery Roadmap

| Phase | Timeline | Focus | Key Deliverables |
|---|---|---|---|
| Phase 1 | Days 1–30 | Build MVP | Auth, catalog, video player, progress, Stripe, AI tutor, forums, landing page |
| Phase 2 | Days 31–60 | Record Course 1 | 12 lessons recorded/edited, transcripts, quizzes + labs, Course 2 50% done |
| Phase 3 | Days 61–90 | Public Launch | Platform live, 20–50 paid users, referrals active, SEO articles, Course 2 done |
| Phase 4 | Months 4–6 | Scale Content | Advanced course, B2B licenses, guest instructors (30% commission), affiliates |
| Phase 5 | Months 7–12 | Expand | Mobile app, local payments, Québec incorporation, university cert partnerships |

---

## 13. Revenue Projections (Conservative)

| Timeline | Paid Users | Revenue/Month | Your Time |
|---|---|---|---|
| Month 3 | 50 paid | $500–$1,500/mo | 5–10 hrs/week |
| Month 6 | 200 paid | $2,000–$5,000/mo | 3–5 hrs/week |
| Month 12 | 500+ paid | $5,000–$15,000/mo | 2–4 hrs/week |
| Year 2+ | 1,000+ paid | $10,000–$30,000+/mo | 2–4 hrs/week |

> *Time drops because the AI tutor handles student questions, courses are pre-recorded, the community is peer-driven, and the platform automates enrollment/payments/certificates.*

---

## 14. Risks & Mitigations

| Risk | Severity | Mitigation |
|---|---|---|
| Solo developer bottleneck | 🔴 High | Use AI coding tools aggressively. Scope MVP ruthlessly. Outsource design if needed |
| Low conversion rate | 🟠 Medium | Optimize free→Pro funnel with trial. A/B test paywall. Strong certificate value prop |
| Content quality vs. competition | 🟠 Medium | French-native advantage. DeepLearning.AI is English-only. Quality > quantity |
| Payment friction (Maghreb) | 🟠 Medium | Start with Stripe. Add BaridiMob/Flouci in Phase 5. Manual payment fallback |
| AI tutor costs at scale | 🟢 Low | ~$0.003/question. 1K users × 10 q/day = ~$900/mo. Revenue covers this |
| GDPR compliance | 🟠 Medium | EU-hosted analytics, Supabase EU region, cookie consent. Legal counsel pre-launch |

---

## 15. Out of Scope (V1)

- Live sessions, webinars, or synchronous teaching
- Mobile native app (deferred to Phase 5)
- Multi-language UI beyond French and English
- Custom LLM fine-tuning or self-hosted AI models
- White-label / corporate training portal (deferred to Year 2)
- Marketplace for third-party instructors (deferred to Phase 4)

---

## 16. Appendix

### 16.1 Glossary

- **PPP:** Purchasing Power Parity — regional pricing adjusted to local economics
- **SCA:** Strong Customer Authentication — EU payment regulation
- **RAG:** Retrieval-Augmented Generation — grounding AI in specific docs
- **DRM:** Digital Rights Management — video content protection

### 16.2 References

- DeepLearning.AI Pro model: free videos + paid labs/certificates ($30/mo or $300/yr)
- 90-Day Action Plan document (internal) — technical architecture and course outlines
