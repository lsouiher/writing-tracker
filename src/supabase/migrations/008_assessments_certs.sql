-- Migration: assessments and certificates tables
-- Phase 5: User Story 3 — Complete a Course and Earn a Certificate

-- quizzes: module-level quizzes with JSONB questions
CREATE TABLE quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  passing_score integer NOT NULL DEFAULT 70,
  questions jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_quizzes_module_id ON quizzes(module_id);

-- quiz_results: student quiz attempts (unlimited retakes)
CREATE TABLE quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  score integer NOT NULL,
  passed boolean NOT NULL,
  answers jsonb NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_quiz_results_user_quiz ON quiz_results(user_id, quiz_id);
CREATE INDEX idx_quiz_results_quiz_id ON quiz_results(quiz_id);

-- labs: module-level coding exercises
CREATE TABLE labs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  language text NOT NULL,
  starter_code text NOT NULL,
  test_cases jsonb NOT NULL,
  solution text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_labs_module_id ON labs(module_id);

-- lab_submissions: student code submissions
CREATE TABLE lab_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lab_id uuid NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
  code text NOT NULL,
  passed boolean NOT NULL,
  output text NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_lab_submissions_user_lab ON lab_submissions(user_id, lab_id);
CREATE INDEX idx_lab_submissions_lab_id ON lab_submissions(lab_id);

-- certificates: verifiable course completion certificates
CREATE TABLE certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  verification_code text NOT NULL UNIQUE,
  pdf_url text NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

CREATE INDEX idx_certificates_verification_code ON certificates(verification_code);
