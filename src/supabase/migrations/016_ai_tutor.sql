-- Migration: ai_tutor_logs table for AI tutor Q&A logging
-- Phase 10: AI Tutor (US2 supplement)

CREATE TABLE ai_tutor_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  was_off_topic boolean NOT NULL DEFAULT false,
  tokens_used integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes per data-model.md
CREATE INDEX idx_ai_tutor_logs_user_id ON ai_tutor_logs(user_id);
CREATE INDEX idx_ai_tutor_logs_lesson_id ON ai_tutor_logs(lesson_id);
CREATE INDEX idx_ai_tutor_logs_user_created ON ai_tutor_logs(user_id, created_at);
