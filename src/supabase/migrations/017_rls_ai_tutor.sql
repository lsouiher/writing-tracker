-- RLS policies for ai_tutor_logs
-- Own rows read, server-only write

ALTER TABLE ai_tutor_logs ENABLE ROW LEVEL SECURITY;

-- Users can read their own tutor logs
CREATE POLICY "Users can read own ai_tutor_logs"
  ON ai_tutor_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Only service role (server) can insert logs
-- No INSERT policy for authenticated = server-only via service role key
CREATE POLICY "Service role can insert ai_tutor_logs"
  ON ai_tutor_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);
