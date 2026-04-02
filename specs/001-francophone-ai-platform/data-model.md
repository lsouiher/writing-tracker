# Data Model: Francophone AI Learning Platform

**Date**: 2026-04-01 | **Source**: spec.md + research.md

## Entity Relationship Overview

```
users ─── subscriptions (1:1 active)
  │  ├── enrollments ─── courses
  │  ├── progress ─── lessons
  │  ├── quiz_results ─── quizzes
  │  ├── lab_submissions ─── labs
  │  ├── certificates ─── courses
  │  ├── community_posts
  │  ├── ai_tutor_logs
  │  └── referrals (as referrer or referee)
  │
courses ─── modules ─── lessons
  │            ├── quizzes
  │            └── labs
  │
team_licenses ─── team_members ─── users
```

## Tables

### users

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK. Matches Supabase auth.users.id |
| email | text | NOT NULL | | UNIQUE |
| full_name | text | NOT NULL | | |
| avatar_url | text | NULL | | Profile image — nullable because OAuth may not provide one |
| country | text | NULL | | ISO 3166-1 alpha-2. Nullable: detected at first visit, confirmed at checkout |
| language | text | NOT NULL | 'fr' | 'fr' or 'en' |
| role | text | NOT NULL | 'student' | 'student', 'team_admin', 'admin' |
| referral_code | text | NOT NULL | nanoid(10) | UNIQUE. User's own referral code |
| referred_by | uuid | NULL | | FK → users.id. Nullable: not everyone is referred |
| deleted_at | timestamptz | NULL | | Soft delete (Constitution IV) |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

**Indexes**: `email` (unique), `referral_code` (unique), `referred_by`, `country`

---

### courses

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| slug | text | NOT NULL | | UNIQUE. Used in URLs (Constitution IV: no internal IDs in URLs) |
| title | text | NOT NULL | | French title |
| title_en | text | NULL | | English title — nullable: EN content added incrementally |
| description | text | NOT NULL | | French description |
| description_en | text | NULL | | |
| level | text | NOT NULL | | 'beginner', 'intermediate', 'advanced' |
| duration_minutes | integer | NOT NULL | | Estimated total duration |
| thumbnail_url | text | NOT NULL | | |
| is_published | boolean | NOT NULL | false | |
| sort_order | integer | NOT NULL | 0 | Catalog ordering |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

**Indexes**: `slug` (unique), `level`, `is_published`, `sort_order`

---

### modules

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| course_id | uuid | NOT NULL | | FK → courses.id |
| slug | text | NOT NULL | | UNIQUE per course |
| title | text | NOT NULL | | |
| description | text | NOT NULL | | |
| sort_order | integer | NOT NULL | 0 | |
| created_at | timestamptz | NOT NULL | now() | |

**Indexes**: `course_id`, (`course_id`, `slug`) unique

---

### lessons

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| module_id | uuid | NOT NULL | | FK → modules.id |
| slug | text | NOT NULL | | UNIQUE per module |
| title | text | NOT NULL | | |
| description | text | NOT NULL | | |
| video_id | text | NOT NULL | | Bunny.net video library ID |
| duration_seconds | integer | NOT NULL | | |
| transcript_fr | text | NOT NULL | | Full French transcript (used for AI tutor context) |
| transcript_en | text | NULL | | Nullable: EN transcripts added later |
| subtitle_url_fr | text | NOT NULL | | WebVTT URL |
| subtitle_url_en | text | NULL | | |
| is_free_preview | boolean | NOT NULL | false | First lesson of each module = true |
| sort_order | integer | NOT NULL | 0 | |
| created_at | timestamptz | NOT NULL | now() | |

**Indexes**: `module_id`, (`module_id`, `slug`) unique, `is_free_preview`

---

### enrollments

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | | FK → users.id |
| course_id | uuid | NOT NULL | | FK → courses.id |
| enrolled_at | timestamptz | NOT NULL | now() | |

**Indexes**: (`user_id`, `course_id`) unique, `course_id`

---

### progress

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | | FK → users.id |
| lesson_id | uuid | NOT NULL | | FK → lessons.id |
| completed | boolean | NOT NULL | false | |
| last_position_seconds | integer | NOT NULL | 0 | Resume position |
| completed_at | timestamptz | NULL | | Nullable: only set when completed=true |
| updated_at | timestamptz | NOT NULL | now() | |

**Indexes**: (`user_id`, `lesson_id`) unique, `lesson_id`

---

### subscriptions

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | | FK → users.id |
| stripe_customer_id | text | NOT NULL | | |
| stripe_subscription_id | text | NOT NULL | | UNIQUE |
| plan | text | NOT NULL | | 'monthly', 'annual' |
| status | text | NOT NULL | | 'trialing', 'active', 'past_due', 'canceled', 'expired' |
| currency | text | NOT NULL | 'eur' | 'eur', 'cad', 'usd' |
| price_region | text | NOT NULL | 'default' | 'default', 'maghreb', 'west_africa', 'canada' |
| trial_ends_at | timestamptz | NULL | | Nullable: only set during trial |
| current_period_end | timestamptz | NOT NULL | | |
| canceled_at | timestamptz | NULL | | Nullable: only set on cancellation |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

**Indexes**: `user_id`, `stripe_subscription_id` (unique), `stripe_customer_id`, `status`

**State transitions**:
```
trialing → active (trial ends, payment succeeds)
trialing → canceled (user cancels during trial)
active → past_due (payment fails)
active → canceled (user cancels — retains access until current_period_end)
past_due → active (retry succeeds)
past_due → expired (3 retries fail over 7 days)
canceled → expired (current_period_end reached)
```

---

### quizzes

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| module_id | uuid | NOT NULL | | FK → modules.id |
| title | text | NOT NULL | | |
| passing_score | integer | NOT NULL | 70 | Percentage |
| questions | jsonb | NOT NULL | | Array of {type, question, options, correct_answer, explanation} |
| created_at | timestamptz | NOT NULL | now() | |

**Indexes**: `module_id`

---

### quiz_results

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | | FK → users.id |
| quiz_id | uuid | NOT NULL | | FK → quizzes.id |
| score | integer | NOT NULL | | Percentage |
| passed | boolean | NOT NULL | | |
| answers | jsonb | NOT NULL | | Student's answers for review |
| completed_at | timestamptz | NOT NULL | now() | |

**Indexes**: (`user_id`, `quiz_id`), `quiz_id`  
Note: No unique constraint — unlimited retakes allowed.

---

### labs

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| module_id | uuid | NOT NULL | | FK → modules.id |
| title | text | NOT NULL | | |
| description | text | NOT NULL | | |
| language | text | NOT NULL | | 'python', 'javascript', 'r' |
| starter_code | text | NOT NULL | | Pre-filled code |
| test_cases | jsonb | NOT NULL | | Array of {input, expected_output} |
| solution | text | NOT NULL | | Reference solution for grading |
| created_at | timestamptz | NOT NULL | now() | |

**Indexes**: `module_id`

---

### lab_submissions

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | | FK → users.id |
| lab_id | uuid | NOT NULL | | FK → labs.id |
| code | text | NOT NULL | | Student's submitted code |
| passed | boolean | NOT NULL | | |
| output | text | NOT NULL | | Execution output |
| submitted_at | timestamptz | NOT NULL | now() | |

**Indexes**: (`user_id`, `lab_id`), `lab_id`

---

### certificates

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | | FK → users.id |
| course_id | uuid | NOT NULL | | FK → courses.id |
| verification_code | text | NOT NULL | | UNIQUE. nanoid(16) for public URL |
| pdf_url | text | NOT NULL | | Supabase Storage URL |
| issued_at | timestamptz | NOT NULL | now() | |

**Indexes**: (`user_id`, `course_id`) unique, `verification_code` (unique)

---

### community_posts

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| course_id | uuid | NOT NULL | | FK → courses.id |
| author_id | uuid | NOT NULL | | FK → users.id |
| parent_id | uuid | NULL | | FK → community_posts.id. Nullable: top-level posts have no parent |
| title | text | NULL | | Nullable: replies don't have titles |
| body | text | NOT NULL | | |
| upvote_count | integer | NOT NULL | 0 | Denormalized for sort performance |
| is_flagged | boolean | NOT NULL | false | AI moderation flag |
| is_removed | boolean | NOT NULL | false | Admin removal |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

**Indexes**: `course_id`, `author_id`, `parent_id`, (`course_id`, `created_at`), `is_flagged`

---

### post_votes

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| user_id | uuid | NOT NULL | | FK → users.id. Composite PK |
| post_id | uuid | NOT NULL | | FK → community_posts.id. Composite PK |
| created_at | timestamptz | NOT NULL | now() | |

**PK**: (`user_id`, `post_id`)  
**Indexes**: `post_id`

---

### ai_tutor_logs

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | | FK → users.id |
| lesson_id | uuid | NOT NULL | | FK → lessons.id |
| question | text | NOT NULL | | |
| answer | text | NOT NULL | | |
| was_off_topic | boolean | NOT NULL | false | |
| tokens_used | integer | NOT NULL | | For cost tracking |
| created_at | timestamptz | NOT NULL | now() | |

**Indexes**: `user_id`, `lesson_id`, (`user_id`, `created_at`)

---

### capstone_submissions

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | | FK → users.id |
| course_id | uuid | NOT NULL | | FK → courses.id |
| title | text | NOT NULL | | Submission title |
| description | text | NOT NULL | | Student's description of their project |
| repository_url | text | NULL | | Nullable: not all capstones are code-based |
| submitted_code | text | NULL | | Nullable: alternative to repository_url |
| ai_score | integer | NULL | | Nullable: score assigned after AI grading (0-100) |
| ai_feedback | text | NULL | | Nullable: AI-generated rubric feedback in French |
| status | text | NOT NULL | 'submitted' | 'submitted', 'grading', 'graded', 'approved' |
| peer_review_open | boolean | NOT NULL | false | Whether community peer review is enabled |
| submitted_at | timestamptz | NOT NULL | now() | |
| graded_at | timestamptz | NULL | | Nullable: only set after AI grading completes |

**Indexes**: (`user_id`, `course_id`) unique, `course_id`, `status`

**State transitions**:
```
submitted → grading (AI grading triggered)
grading → graded (AI grading complete)
graded → approved (score ≥ 70% auto-approved, or manual admin approval)
```

---

### capstone_reviews

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| submission_id | uuid | NOT NULL | | FK → capstone_submissions.id |
| reviewer_id | uuid | NOT NULL | | FK → users.id |
| rating | integer | NOT NULL | | 1-5 scale |
| comment | text | NOT NULL | | Reviewer's feedback |
| created_at | timestamptz | NOT NULL | now() | |

**Indexes**: (`submission_id`, `reviewer_id`) unique, `submission_id`

---

### team_licenses

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| admin_id | uuid | NOT NULL | | FK → users.id |
| stripe_subscription_id | text | NOT NULL | | |
| seat_count | integer | NOT NULL | | 5-50 |
| seats_used | integer | NOT NULL | 0 | |
| status | text | NOT NULL | | 'active', 'canceled', 'expired' |
| created_at | timestamptz | NOT NULL | now() | |
| updated_at | timestamptz | NOT NULL | now() | |

**Indexes**: `admin_id`, `stripe_subscription_id`

---

### team_members

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| team_license_id | uuid | NOT NULL | | FK → team_licenses.id |
| user_id | uuid | NOT NULL | | FK → users.id |
| invited_email | text | NOT NULL | | Email used for invitation |
| accepted_at | timestamptz | NULL | | Nullable: pending invitations haven't been accepted |
| removed_at | timestamptz | NULL | | Nullable: soft remove (Constitution IV) |
| created_at | timestamptz | NOT NULL | now() | |

**Indexes**: (`team_license_id`, `user_id`) unique, `user_id`, `invited_email`

---

### referrals

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| referrer_id | uuid | NOT NULL | | FK → users.id |
| referee_id | uuid | NOT NULL | | FK → users.id |
| status | text | NOT NULL | 'pending' | 'pending', 'completed' (referee subscribed to Pro) |
| reward_applied | boolean | NOT NULL | false | Both parties got free month |
| created_at | timestamptz | NOT NULL | now() | |
| completed_at | timestamptz | NULL | | Nullable: only set when status='completed' |

**Indexes**: (`referrer_id`, `referee_id`) unique, `referee_id`, `status`

---

### moderation_flags

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| post_id | uuid | NOT NULL | | FK → community_posts.id |
| reason | text | NOT NULL | | AI-generated reason |
| reviewed | boolean | NOT NULL | false | |
| reviewed_by | uuid | NULL | | FK → users.id. Nullable: not yet reviewed |
| decision | text | NULL | | 'approved', 'removed'. Nullable: pending review |
| created_at | timestamptz | NOT NULL | now() | |
| reviewed_at | timestamptz | NULL | | |

**Indexes**: `post_id`, `reviewed`, (`reviewed`, `created_at`)

---

### coupons

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| id | uuid | NOT NULL | gen_random_uuid() | PK |
| code | text | NOT NULL | | UNIQUE. Admin-created code (e.g., 'EARLYBIRD50') |
| discount_percent | integer | NOT NULL | | 1-100 |
| max_uses | integer | NOT NULL | | |
| current_uses | integer | NOT NULL | 0 | |
| expires_at | timestamptz | NULL | | Nullable: some coupons don't expire |
| created_at | timestamptz | NOT NULL | now() | |

**Indexes**: `code` (unique)

---

## RLS Policy Summary

| Table | Read | Write | Delete |
|-------|------|-------|--------|
| courses, modules, lessons | All (public) | Admin only | Admin only |
| enrollments | Own rows | Authenticated | — |
| progress | Own rows | Own rows | — |
| subscriptions | Own rows | Server only (webhooks) | — |
| quizzes | Authenticated | Admin only | Admin only |
| quiz_results | Own rows | Pro users (own rows) | — |
| labs | Authenticated | Admin only | Admin only |
| lab_submissions | Own rows | Pro users (own rows) | — |
| certificates | Own rows + public verify | Server only | — |
| community_posts | Authenticated (read) | Pro users (write) | — |
| post_votes | Own rows | Pro users | Own rows |
| ai_tutor_logs | Own rows | Server only | — |
| capstone_submissions | Own rows + course peers (if peer_review_open) | Pro users (own rows) | — |
| capstone_reviews | Submission owner + reviewer | Pro users (on open submissions) | — |
| team_licenses | Admin of team | Server only | — |
| team_members | Team admin + own row | Team admin | — |
| referrals | Own rows (as referrer) | Server only | — |
| moderation_flags | Admin only | Server only | — |
| coupons | Server only | Admin only | — |
