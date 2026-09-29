ALTER TABLE lms.assessments
  ADD COLUMN content_hash TEXT NOT NULL DEFAULT '',
  ADD COLUMN review_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (review_status IN ('pending', 'approved', 'changes_requested')),
  ADD COLUMN review_date DATE,
  ADD COLUMN reviewer_name TEXT;

ALTER TABLE lms.assessments
  ADD CONSTRAINT assessments_snapshot_unique UNIQUE (id,course_version_id,version_number),
  ADD CONSTRAINT assessments_id_version_unique UNIQUE (id,version_number),
  ADD CONSTRAINT assessments_publish_requires_review CHECK (status <> 'published' OR review_status='approved');

ALTER TABLE lms.assessment_attempts
  ADD COLUMN course_version_id UUID,
  ADD COLUMN assessment_version_number INTEGER,
  ADD COLUMN feedback JSONB NOT NULL DEFAULT '{}'::jsonb;

UPDATE lms.assessment_attempts aa
SET course_version_id=a.course_version_id, assessment_version_number=a.version_number
FROM lms.assessments a WHERE a.id=aa.assessment_id;

ALTER TABLE lms.assessment_attempts
  ALTER COLUMN course_version_id SET NOT NULL,
  ALTER COLUMN assessment_version_number SET NOT NULL,
  ADD CONSTRAINT assessment_attempts_assessment_snapshot_fk
    FOREIGN KEY (assessment_id,course_version_id,assessment_version_number)
    REFERENCES lms.assessments(id,course_version_id,version_number),
  ADD CONSTRAINT assessment_attempts_course_version_fk
    FOREIGN KEY (course_version_id) REFERENCES lms.course_versions(id),
  ADD CONSTRAINT assessment_attempts_version_positive CHECK (assessment_version_number > 0);

CREATE TABLE lms.assessment_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES lms.assessments(id) ON DELETE RESTRICT,
  assessment_version_number INTEGER NOT NULL CHECK (assessment_version_number > 0),
  reviewer_name TEXT NOT NULL CHECK (length(trim(reviewer_name)) BETWEEN 1 AND 160),
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'changes_requested')),
  notes TEXT NOT NULL CHECK (length(trim(notes)) BETWEEN 1 AND 10000),
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (assessment_id,assessment_version_number)
    REFERENCES lms.assessments(id,version_number) DEFERRABLE INITIALLY IMMEDIATE
);
CREATE INDEX assessment_reviews_latest_idx ON lms.assessment_reviews (assessment_id, reviewed_at DESC);

CREATE FUNCTION lms.prevent_assessment_review_mutation() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Assessment review records are append-only.';
END;
$$;
CREATE TRIGGER append_only_assessment_reviews
  BEFORE UPDATE OR DELETE ON lms.assessment_reviews
  FOR EACH ROW EXECUTE FUNCTION lms.prevent_assessment_review_mutation();

CREATE FUNCTION lms.prevent_published_assessment_change() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE assessment_id UUID; version_id UUID;
BEGIN
  IF TG_TABLE_NAME = 'assessments' THEN
    assessment_id := COALESCE(OLD.id, NEW.id);
    version_id := COALESCE(OLD.course_version_id, NEW.course_version_id);
  ELSE
    assessment_id := COALESCE(OLD.assessment_id, NEW.assessment_id);
    SELECT course_version_id INTO version_id FROM lms.assessments WHERE id=assessment_id;
  END IF;

  IF EXISTS (SELECT 1 FROM lms.assessments WHERE id=assessment_id AND status='published')
     OR EXISTS (SELECT 1 FROM lms.course_versions WHERE id=version_id AND status='published') THEN
    RAISE EXCEPTION 'Published assessment content is immutable; create a new assessment/course version.';
  END IF;
  IF TG_OP='DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER immutable_published_assessment
  BEFORE UPDATE OR DELETE ON lms.assessments
  FOR EACH ROW EXECUTE FUNCTION lms.prevent_published_assessment_change();
CREATE TRIGGER immutable_published_assessment_questions
  BEFORE INSERT OR UPDATE OR DELETE ON lms.assessment_questions
  FOR EACH ROW EXECUTE FUNCTION lms.prevent_published_assessment_change();

CREATE FUNCTION lms.prevent_submitted_attempt_change() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.status <> 'in_progress' THEN
    RAISE EXCEPTION 'Submitted or abandoned assessment attempts are immutable.';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER immutable_submitted_attempt
  BEFORE UPDATE ON lms.assessment_attempts
  FOR EACH ROW EXECUTE FUNCTION lms.prevent_submitted_attempt_change();

GRANT SELECT ON lms.assessment_reviews TO lms_app;
COMMENT ON COLUMN lms.assessment_attempts.course_version_id IS 'Course version fixed at attempt creation; stale enrollment versions cannot be graded against new content.';
COMMENT ON COLUMN lms.assessment_attempts.assessment_version_number IS 'Assessment revision fixed at attempt creation for reproducible grading.';
COMMENT ON TABLE lms.assessment_reviews IS 'Append-only subject-matter assessment review record; public learner routes cannot write review decisions.';
