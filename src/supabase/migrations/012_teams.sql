-- Migration: team licenses and members
-- Phase 7: User Story 5 — B2B Team License Purchase

CREATE TABLE team_licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id text NOT NULL,
  seat_count integer NOT NULL,
  seats_used integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_team_licenses_admin_id ON team_licenses(admin_id);
CREATE INDEX idx_team_licenses_stripe_sub ON team_licenses(stripe_subscription_id);

CREATE TABLE team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_license_id uuid NOT NULL REFERENCES team_licenses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  invited_email text NOT NULL,
  accepted_at timestamptz,
  removed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(team_license_id, user_id)
);

CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_invited_email ON team_members(invited_email);
