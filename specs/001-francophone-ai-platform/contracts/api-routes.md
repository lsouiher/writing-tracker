# API Route Contracts

**Date**: 2026-04-01

All routes are Next.js Route Handlers under `/app/api/`. All responses follow a consistent shape (Constitution V).

## Response Shape

```typescript
// Success
{ data: T, error: null }

// Error
{ data: null, error: { code: string, message: string } }
```

HTTP status codes: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden — wrong tier), 404 (Not Found), 429 (Rate Limited), 500 (Internal Error).

---

## Public Routes (No Auth)

### GET /api/courses
List published courses.

**Query params**: `level?` (beginner|intermediate|advanced), `page?` (default: 1), `limit?` (default: 20)

**Response 200**:
```json
{
  "data": {
    "courses": [
      {
        "slug": "introduction-ml",
        "title": "Introduction au Machine Learning",
        "description": "...",
        "level": "beginner",
        "duration_minutes": 480,
        "thumbnail_url": "https://...",
        "module_count": 8,
        "lesson_count": 32
      }
    ],
    "total": 12,
    "page": 1,
    "limit": 20
  },
  "error": null
}
```

### GET /api/courses/[slug]
Get course detail with modules and lessons.

**Response 200**:
```json
{
  "data": {
    "slug": "introduction-ml",
    "title": "Introduction au Machine Learning",
    "description": "...",
    "level": "beginner",
    "duration_minutes": 480,
    "thumbnail_url": "https://...",
    "modules": [
      {
        "slug": "regression-lineaire",
        "title": "Régression Linéaire",
        "sort_order": 1,
        "lessons": [
          {
            "slug": "introduction",
            "title": "Introduction à la régression",
            "duration_seconds": 720,
            "is_free_preview": true
          }
        ],
        "has_quiz": true,
        "has_lab": true
      }
    ]
  },
  "error": null
}
```

### GET /api/verify/[code]
Verify a certificate.

**Response 200**:
```json
{
  "data": {
    "holder_name": "Ahmed Benali",
    "course_title": "Introduction au Machine Learning",
    "issued_at": "2026-05-15T10:00:00Z",
    "valid": true
  },
  "error": null
}
```

**Response 404**: `{ "data": null, "error": { "code": "NOT_FOUND", "message": "Certificat introuvable" } }`

---

## Authenticated Routes (Free + Pro)

### GET /api/lessons/[slug]/video
Get signed video URL for a lesson. Free users can only access `is_free_preview` lessons.

**Response 200**:
```json
{
  "data": {
    "video_url": "https://video.bunnycdn.com/play/...?token=...&expires=...",
    "subtitle_url_fr": "https://...",
    "subtitle_url_en": "https://...",
    "transcript_fr": "...",
    "resume_position_seconds": 120
  },
  "error": null
}
```

**Response 403**: Free user trying to access non-preview lesson.

### POST /api/progress
Update lesson progress.

**Body**:
```json
{
  "lesson_id": "uuid",
  "position_seconds": 360,
  "completed": false
}
```

**Response 200**: `{ "data": { "updated": true }, "error": null }`

### GET /api/dashboard
Get user dashboard data.

**Response 200**:
```json
{
  "data": {
    "enrollments": [
      {
        "course_slug": "introduction-ml",
        "course_title": "Introduction au Machine Learning",
        "progress_percent": 45,
        "modules": [
          {
            "title": "Régression Linéaire",
            "lessons_completed": 3,
            "lessons_total": 4,
            "quiz_passed": true,
            "lab_passed": false
          }
        ]
      }
    ],
    "certificates": [
      {
        "course_title": "Python pour la Data Science",
        "verification_code": "abc123xyz",
        "issued_at": "2026-04-15T10:00:00Z",
        "pdf_url": "https://..."
      }
    ],
    "subscription": {
      "status": "active",
      "plan": "monthly",
      "current_period_end": "2026-05-01T00:00:00Z"
    }
  },
  "error": null
}
```

### POST /api/enrollments
Enroll in a course.

**Body**: `{ "course_id": "uuid" }`

**Response 201**: `{ "data": { "enrollment_id": "uuid" }, "error": null }`

---

## Pro-Only Routes

### POST /api/ai-tutor
Ask the AI tutor a question. Rate-limited: 5/day (free), 30/hour (Pro).

**Body**:
```json
{
  "lesson_id": "uuid",
  "question": "Quelle est la différence entre la régression linéaire et logistique?",
  "session_messages": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

**Response 200** (streaming): Server-Sent Events with text chunks.
```
data: {"chunk": "La différence principale..."}
data: {"chunk": " entre la régression..."}
data: {"done": true, "was_off_topic": false, "tokens_used": 245}
```

**Response 429**: Rate limit exceeded.
**Response 403**: Free user without remaining daily questions.

### POST /api/labs/[labId]/submit
Submit lab code for execution.

**Body**: `{ "code": "print('hello')", "language": "python" }`

**Response 200**:
```json
{
  "data": {
    "passed": true,
    "output": "hello\n",
    "test_results": [
      { "input": "", "expected": "hello", "actual": "hello", "passed": true }
    ]
  },
  "error": null
}
```

### POST /api/quizzes/[quizId]/submit
Submit quiz answers.

**Body**:
```json
{
  "answers": [
    { "question_index": 0, "answer": "B" },
    { "question_index": 1, "answer": "gradient descent" }
  ]
}
```

**Response 200**:
```json
{
  "data": {
    "score": 85,
    "passed": true,
    "feedback": [
      { "question_index": 0, "correct": true, "explanation": "..." },
      { "question_index": 1, "correct": false, "explanation": "..." }
    ]
  },
  "error": null
}
```

### POST /api/capstones
Submit a capstone project. Pro only.

**Body**:
```json
{
  "course_id": "uuid",
  "title": "Mon projet de Machine Learning",
  "description": "Application de classification d'images...",
  "repository_url": "https://github.com/user/project",
  "submitted_code": null
}
```

**Response 201**: `{ "data": { "submission_id": "uuid", "status": "submitted" }, "error": null }`

### POST /api/capstones/[submissionId]/grade
Trigger AI grading for a capstone. Pro only (owner).

**Response 200**:
```json
{
  "data": {
    "score": 82,
    "status": "graded",
    "feedback": "Excellent travail sur la classification d'images. Points forts: ...",
    "passed": true
  },
  "error": null
}
```

### POST /api/capstones/[submissionId]/review
Submit a peer review for an open capstone. Pro only.

**Body**:
```json
{
  "rating": 4,
  "comment": "Très bon projet, la documentation est claire..."
}
```

**Response 201**: `{ "data": { "review_id": "uuid" }, "error": null }`

---

### GET /api/community/[courseSlug]/posts
List community posts for a course. Read access for all authenticated users.

**Query params**: `sort?` (recent|top), `cursor?`, `limit?` (default: 20)

**Response 200**:
```json
{
  "data": {
    "posts": [
      {
        "id": "uuid",
        "title": "Question sur le gradient descent",
        "body": "...",
        "author_name": "Ahmed B.",
        "upvote_count": 5,
        "reply_count": 3,
        "created_at": "2026-04-10T14:00:00Z",
        "user_has_voted": false
      }
    ],
    "next_cursor": "uuid"
  },
  "error": null
}
```

### POST /api/community/[courseSlug]/posts
Create a post or reply. Pro only.

**Body**:
```json
{
  "title": "Question sur le gradient descent",
  "body": "Je ne comprends pas pourquoi...",
  "parent_id": null
}
```

**Response 201**: `{ "data": { "post_id": "uuid" }, "error": null }`

### POST /api/community/posts/[postId]/vote
Toggle upvote. Pro only.

**Response 200**: `{ "data": { "upvoted": true, "new_count": 6 }, "error": null }`

---

## Payment Routes

### POST /api/stripe/checkout
Create a Stripe Checkout session for Pro subscription or team license.

**Body**:
```json
{
  "plan": "monthly",
  "coupon_code": "EARLYBIRD50"
}
```

**Response 200**: `{ "data": { "checkout_url": "https://checkout.stripe.com/..." }, "error": null }`

### POST /api/stripe/portal
Create a Stripe Customer Portal session for subscription management.

**Response 200**: `{ "data": { "portal_url": "https://billing.stripe.com/..." }, "error": null }`

### POST /api/webhooks/stripe
Stripe webhook handler. Verifies signature. Updates `subscriptions` table.

**Events handled**: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`, `invoice.paid`, `checkout.session.completed`

**Response 200**: `{ "received": true }`

---

## Admin Routes

All admin routes require `role = 'admin'`.

### GET /api/admin/dashboard
Revenue, user counts, AI tutor usage, moderation queue count.

### GET /api/admin/moderation
List flagged posts pending review.

### POST /api/admin/moderation/[flagId]
Approve or remove flagged content.

**Body**: `{ "decision": "approved" | "removed" }`

### POST /api/admin/coupons
Create a coupon code.

**Body**: `{ "code": "EARLYBIRD50", "discount_percent": 50, "max_uses": 100 }`

---

## Team Routes

### POST /api/teams/checkout
Create checkout for team license.

**Body**: `{ "seat_count": 10 }`

### POST /api/teams/invite
Invite team members.

**Body**: `{ "emails": ["member@company.com"] }`

### GET /api/teams/dashboard
Team admin dashboard: members, progress, completion reports.

### DELETE /api/teams/members/[memberId]
Remove a team member. Seat freed immediately.
