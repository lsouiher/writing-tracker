-- Migration: capstone submissions and reviews tables
-- Phase 5: User Story 3 — Capstone projects

-- capstone_submissions: student capstone project submissions
CREATE TABLE capstone_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  repository_url text,
  submitted_code text,
  ai_score integer,
  ai_feedback text,
  status text NOT NULL DEFAULT 'submitted',
  peer_review_open boolean NOT NULL DEFAULT false,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  graded_at timestamptz,
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_capstone_submissions_course_id ON capstone_submissions(course_id);
CREATE INDEX idx_capstone_submissions_status ON capstone_submissions(status);

-- capstone_reviews: peer reviews on capstone submissions
CREATE TABLE capstone_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES capstone_submissions(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating integer NOT NULL,
  comment text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(submission_id, reviewer_id)
);

CREATE INDEX idx_capstone_reviews_submission_id ON capstone_reviews(submission_id);
