-- Migration: community tables
-- Phase 6: User Story 4 — Participate in the Community

-- community_posts: course-specific Q&A forum posts and replies
CREATE TABLE community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES community_posts(id) ON DELETE CASCADE,
  title text,
  body text NOT NULL,
  upvote_count integer NOT NULL DEFAULT 0,
  is_flagged boolean NOT NULL DEFAULT false,
  is_removed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_community_posts_course_id ON community_posts(course_id);
CREATE INDEX idx_community_posts_author_id ON community_posts(author_id);
CREATE INDEX idx_community_posts_parent_id ON community_posts(parent_id);
CREATE INDEX idx_community_posts_course_created ON community_posts(course_id, created_at);
CREATE INDEX idx_community_posts_is_flagged ON community_posts(is_flagged);

-- post_votes: upvote toggle (composite PK)
CREATE TABLE post_votes (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, post_id)
);

CREATE INDEX idx_post_votes_post_id ON post_votes(post_id);

-- moderation_flags: AI-generated content flags for admin review
CREATE TABLE moderation_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  reason text NOT NULL,
  reviewed boolean NOT NULL DEFAULT false,
  reviewed_by uuid REFERENCES users(id),
  decision text,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

CREATE INDEX idx_moderation_flags_post_id ON moderation_flags(post_id);
CREATE INDEX idx_moderation_flags_reviewed ON moderation_flags(reviewed);
CREATE INDEX idx_moderation_flags_reviewed_created ON moderation_flags(reviewed, created_at);
