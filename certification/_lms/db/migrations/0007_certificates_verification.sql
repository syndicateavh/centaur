ALTER TABLE lms.certificates
  ADD COLUMN course_title_snapshot TEXT,
  ADD COLUMN recipient_name_snapshot TEXT,
  ADD COLUMN issuer_name TEXT NOT NULL DEFAULT 'Centaur Careers',
  ADD COLUMN credential_description TEXT NOT NULL DEFAULT 'Course Completion Certificate',
  ADD COLUMN public_holder_name BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN revoked_by UUID REFERENCES lms."user"(id) ON DELETE SET NULL,
  ADD COLUMN reissue_reason TEXT,
  ADD COLUMN reissued_from_certificate_id UUID REFERENCES lms.certificates(id) ON DELETE RESTRICT;

UPDATE lms.certificates cert
SET course_title_snapshot = c.title,
    recipient_name_snapshot = COALESCE(p.display_name, u.name, 'Learner')
FROM lms.courses c
JOIN lms."user" u ON TRUE
LEFT JOIN lms.profiles p ON p.user_id = u.id
WHERE cert.course_id = c.id AND cert.user_id = u.id
  AND (cert.course_title_snapshot IS NULL OR cert.recipient_name_snapshot IS NULL);

UPDATE lms.certificates SET public_id = 'CTC-' || upper(replace(gen_random_uuid()::text, '-', ''))
WHERE public_id !~ '^CTC-[A-F0-9]{32}$';
UPDATE lms.certificates SET revoked_at = COALESCE(revoked_at, issued_at),
    revocation_reason = COALESCE(NULLIF(trim(revocation_reason), ''), 'Reason not recorded before certificate controls upgrade')
WHERE status = 'revoked';
UPDATE lms.certificates SET revoked_at = NULL, revocation_reason = NULL, revoked_by = NULL
WHERE status = 'active';

ALTER TABLE lms.certificates
  ALTER COLUMN course_title_snapshot SET NOT NULL,
  ALTER COLUMN recipient_name_snapshot SET NOT NULL,
  ADD CONSTRAINT certificates_public_id_format CHECK (public_id ~ '^CTC-[A-F0-9]{32}$'),
  ADD CONSTRAINT certificates_name_length CHECK (length(trim(course_title_snapshot)) BETWEEN 1 AND 200 AND length(trim(recipient_name_snapshot)) BETWEEN 1 AND 100),
  ADD CONSTRAINT certificates_revocation_fields CHECK (
    (status = 'active' AND revoked_at IS NULL AND revocation_reason IS NULL AND revoked_by IS NULL)
    OR (status = 'revoked' AND revoked_at IS NOT NULL AND length(trim(COALESCE(revocation_reason, ''))) BETWEEN 1 AND 1000)
  );

CREATE UNIQUE INDEX one_active_certificate_per_course_version
  ON lms.certificates (user_id, course_id, course_version_id) WHERE status = 'active';
CREATE INDEX certificates_recent_idx ON lms.certificates (issued_at DESC);

CREATE POLICY certificates_insert_eligible_owner ON lms.certificates
  FOR INSERT WITH CHECK (
    user_id = lms.current_learner_id()
    OR EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id = lms.current_learner_id() AND r.role = 'admin')
  );
CREATE POLICY certificates_admin_read ON lms.certificates
  FOR SELECT USING (EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id = lms.current_learner_id() AND r.role = 'admin'));
CREATE POLICY certificates_admin_update ON lms.certificates
  FOR UPDATE USING (EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id = lms.current_learner_id() AND r.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id = lms.current_learner_id() AND r.role = 'admin'));

CREATE FUNCTION lms.certificate_issue_eligibility(p_user_id UUID, p_course_id UUID, p_version_id UUID)
RETURNS TABLE (course_title TEXT, version_number INTEGER, recipient_name TEXT)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, lms
AS $$
BEGIN
  RETURN QUERY
    SELECT c.title,v.version_number,p.display_name
    FROM lms.enrollments e
    JOIN lms.courses c ON c.id=e.course_id
    JOIN lms.course_versions v ON v.id=e.course_version_id AND v.course_id=c.id
    JOIN lms.profiles p ON p.user_id=e.user_id
    WHERE e.user_id=p_user_id AND e.course_id=p_course_id AND e.course_version_id=p_version_id AND e.status='completed' AND e.completed_at IS NOT NULL
      AND c.status IN ('published','archived') AND c.is_sandbox=FALSE
      AND v.status IN ('published','retired') AND v.review_status='approved'
      AND EXISTS (SELECT 1 FROM lms.lessons l JOIN lms.modules m ON m.id=l.module_id WHERE m.course_version_id=v.id)
      AND NOT EXISTS (SELECT 1 FROM lms.lessons l JOIN lms.modules m ON m.id=l.module_id
        LEFT JOIN lms.lesson_progress lp ON lp.lesson_id=l.id AND lp.user_id=e.user_id
        WHERE m.course_version_id=v.id AND (l.published=FALSE OR COALESCE(lp.status,'not_started') <> 'completed'))
      AND EXISTS (SELECT 1 FROM lms.assessments a JOIN lms.assessment_attempts aa ON aa.assessment_id=a.id
        WHERE a.course_version_id=v.id AND a.rules->>'kind'='final'
          AND a.version_number=(SELECT max(a2.version_number) FROM lms.assessments a2 WHERE a2.course_version_id=v.id AND a2.slug=a.slug)
          AND a.status IN ('published','retired') AND a.review_status='approved'
          AND aa.user_id=e.user_id AND aa.course_version_id=v.id AND aa.assessment_version_number=a.version_number
          AND aa.status='submitted' AND aa.passed=TRUE)
    FOR UPDATE OF e;
END;
$$;
REVOKE ALL ON FUNCTION lms.certificate_issue_eligibility(UUID,UUID,UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION lms.certificate_issue_eligibility(UUID,UUID,UUID) TO lms_app;

CREATE FUNCTION lms.guard_certificate_update() RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status <> 'active' OR NEW.status <> 'revoked'
    OR (to_jsonb(NEW) - ARRAY['status','revoked_at','revocation_reason','revoked_by'])
       IS DISTINCT FROM (to_jsonb(OLD) - ARRAY['status','revoked_at','revocation_reason','revoked_by'])
    OR NEW.revoked_at IS NULL OR NEW.revoked_by IS NULL OR length(trim(COALESCE(NEW.revocation_reason, ''))) = 0 THEN
    RAISE EXCEPTION 'Certificate records are immutable; only an audited active-to-revoked transition is allowed';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER certificates_immutable_update
  BEFORE UPDATE ON lms.certificates FOR EACH ROW EXECUTE FUNCTION lms.guard_certificate_update();

CREATE FUNCTION lms.verify_certificate(p_public_id TEXT)
RETURNS TABLE (
  public_id TEXT,
  course_title TEXT,
  course_version INTEGER,
  issuer_name TEXT,
  credential_description TEXT,
  issued_at TIMESTAMPTZ,
  status TEXT,
  holder_name TEXT
)
LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = pg_catalog, lms
AS $$
  SELECT cert.public_id, cert.course_title_snapshot, v.version_number,
    cert.issuer_name, cert.credential_description, cert.issued_at, cert.status,
    CASE WHEN cert.public_holder_name THEN cert.recipient_name_snapshot ELSE NULL END
  FROM lms.certificates cert
  JOIN lms.course_versions v ON v.id = cert.course_version_id
  WHERE p_public_id ~ '^CTC-[A-F0-9]{32}$' AND cert.public_id = p_public_id
  LIMIT 1
$$;
REVOKE ALL ON FUNCTION lms.verify_certificate(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION lms.verify_certificate(TEXT) TO lms_app;
GRANT INSERT, UPDATE ON lms.certificates TO lms_app;

COMMENT ON FUNCTION lms.verify_certificate(TEXT) IS 'Returns only the approved public verification fields for one opaque certificate ID.';
