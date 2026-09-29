ALTER TABLE lms.course_versions
  ADD COLUMN review_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (review_status IN ('pending', 'approved', 'changes_requested')),
  ADD COLUMN review_date DATE,
  ADD COLUMN reviewer_name TEXT,
  ADD COLUMN learning_objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN glossary JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN content_sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN case_packet JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE FUNCTION lms.version_for_module(module_id UUID) RETURNS UUID
LANGUAGE SQL STABLE AS $$ SELECT course_version_id FROM lms.modules WHERE id = module_id $$;

CREATE FUNCTION lms.prevent_published_course_content_change() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE version_id UUID;
BEGIN
  IF TG_TABLE_NAME = 'course_versions' THEN
    version_id := COALESCE(OLD.id, NEW.id);
  ELSIF TG_TABLE_NAME = 'modules' THEN
    version_id := COALESCE(OLD.course_version_id, NEW.course_version_id);
  ELSE
    version_id := lms.version_for_module(COALESCE(OLD.module_id, NEW.module_id));
  END IF;

  IF EXISTS (SELECT 1 FROM lms.course_versions WHERE id = version_id AND status = 'published') THEN
    RAISE EXCEPTION 'Published course content is immutable; create a new course version.';
  END IF;

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER immutable_published_version
  BEFORE UPDATE OR DELETE ON lms.course_versions
  FOR EACH ROW EXECUTE FUNCTION lms.prevent_published_course_content_change();
CREATE TRIGGER immutable_published_modules
  BEFORE INSERT OR UPDATE OR DELETE ON lms.modules
  FOR EACH ROW EXECUTE FUNCTION lms.prevent_published_course_content_change();
CREATE TRIGGER immutable_published_lessons
  BEFORE INSERT OR UPDATE OR DELETE ON lms.lessons
  FOR EACH ROW EXECUTE FUNCTION lms.prevent_published_course_content_change();

COMMENT ON COLUMN lms.course_versions.review_status IS 'Subject-matter review state; publication approval is a separate decision.';
COMMENT ON COLUMN lms.course_versions.content_sources IS 'Versioned official source register for reviewer traceability.';
