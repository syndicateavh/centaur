CREATE TABLE lms.pilot_course_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES lms.courses(id) ON DELETE CASCADE,
  email_fingerprint TEXT NOT NULL CHECK (email_fingerprint ~ '^[A-F0-9]{64}$'),
  invited_by UUID NOT NULL REFERENCES lms."user"(id) ON DELETE RESTRICT,
  expires_at TIMESTAMPTZ NOT NULL,
  redeemed_by UUID REFERENCES lms."user"(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id,email_fingerprint),
  CHECK ((redeemed_by IS NULL) = (redeemed_at IS NULL))
);
CREATE INDEX pilot_course_invites_course_expiry_idx ON lms.pilot_course_invites(course_id,expires_at);
ALTER TABLE lms.pilot_course_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY pilot_course_invites_admin_read ON lms.pilot_course_invites FOR SELECT
  USING (EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role='admin'));
CREATE POLICY pilot_course_invites_admin_insert ON lms.pilot_course_invites FOR INSERT
  WITH CHECK (invited_by=lms.current_learner_id() AND EXISTS (
    SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role='admin'));
CREATE POLICY pilot_course_invites_admin_update ON lms.pilot_course_invites FOR UPDATE
  USING (EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role='admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role='admin'));
GRANT SELECT,INSERT ON lms.pilot_course_invites TO lms_app;
GRANT UPDATE(expires_at) ON lms.pilot_course_invites TO lms_app;

CREATE FUNCTION lms.redeem_pilot_course_invite(p_course_id UUID,p_user_id UUID,p_email_fingerprint TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,lms AS $$
DECLARE invite_id UUID;
BEGIN
  IF lms.current_learner_id() IS DISTINCT FROM p_user_id OR p_email_fingerprint !~ '^[A-F0-9]{64}$' THEN
    RAISE EXCEPTION 'Pilot invitation identity check failed.';
  END IF;
  SELECT id INTO invite_id FROM lms.pilot_course_invites
    WHERE course_id=p_course_id AND email_fingerprint=p_email_fingerprint AND expires_at>now()
      AND redeemed_at IS NULL FOR UPDATE;
  IF invite_id IS NULL THEN RETURN FALSE; END IF;
  UPDATE lms.pilot_course_invites SET redeemed_by=p_user_id,redeemed_at=now() WHERE id=invite_id;
  RETURN TRUE;
END;
$$;
REVOKE ALL ON FUNCTION lms.redeem_pilot_course_invite(UUID,UUID,TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION lms.redeem_pilot_course_invite(UUID,UUID,TEXT) TO lms_app;

CREATE TABLE lms.pilot_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES lms."user"(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES lms.courses(id) ON DELETE CASCADE,
  overall_rating SMALLINT NOT NULL CHECK (overall_rating BETWEEN 1 AND 5),
  instruction_clarity SMALLINT NOT NULL CHECK (instruction_clarity BETWEEN 1 AND 5),
  confidence_after SMALLINT CHECK (confidence_after IS NULL OR confidence_after BETWEEN 1 AND 5),
  issue_categories TEXT[] NOT NULL DEFAULT '{}',
  comment TEXT NOT NULL DEFAULT '' CHECK (length(comment)<=2000),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id,course_id),
  CHECK (cardinality(issue_categories)<=5),
  CHECK (issue_categories <@ ARRAY['unclear_instruction','content_gap','assessment','accessibility','mobile','technical','other']::TEXT[])
);
CREATE INDEX pilot_feedback_course_submitted_idx ON lms.pilot_feedback(course_id,submitted_at DESC);
ALTER TABLE lms.pilot_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY pilot_feedback_own_read ON lms.pilot_feedback FOR SELECT USING (user_id=lms.current_learner_id());
CREATE POLICY pilot_feedback_own_insert ON lms.pilot_feedback FOR INSERT WITH CHECK (
  user_id=lms.current_learner_id() AND EXISTS (
    SELECT 1 FROM lms.enrollments e WHERE e.user_id=lms.current_learner_id() AND e.course_id=pilot_feedback.course_id));
CREATE POLICY pilot_feedback_admin_read ON lms.pilot_feedback FOR SELECT USING (
  EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role='admin'));
GRANT SELECT,INSERT ON lms.pilot_feedback TO lms_app;

CREATE POLICY lesson_progress_admin_read ON lms.lesson_progress FOR SELECT USING (
  EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role='admin'));

COMMENT ON TABLE lms.pilot_course_invites IS 'Course-level controlled pilot allowlist; email addresses are never stored, only a secret-keyed fingerprint.';
COMMENT ON TABLE lms.pilot_feedback IS 'Optional course pilot feedback; account-bound and restricted to the learner and authorized administrators.';
