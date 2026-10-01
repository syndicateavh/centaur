CREATE FUNCTION lms.prevent_approved_assessment_question_change() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  assessment_id UUID;
BEGIN
  assessment_id := COALESCE(OLD.assessment_id, NEW.assessment_id);
  IF EXISTS (
    SELECT 1 FROM lms.assessments
    WHERE id=assessment_id AND review_status='approved'
  ) THEN
    RAISE EXCEPTION 'Approved assessment content is immutable; create a new assessment version.';
  END IF;
  IF TG_OP='DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER freeze_approved_assessment_questions
  BEFORE INSERT OR UPDATE OR DELETE ON lms.assessment_questions
  FOR EACH ROW EXECUTE FUNCTION lms.prevent_approved_assessment_question_change();

COMMENT ON FUNCTION lms.prevent_approved_assessment_question_change() IS
  'Prevents edits to an approved question set; assessment revisions require a new version and a new review.';
