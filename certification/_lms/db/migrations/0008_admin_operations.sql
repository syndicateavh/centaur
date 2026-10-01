ALTER TABLE lms.course_versions ADD COLUMN scheduled_publish_at TIMESTAMPTZ;
ALTER TABLE lms.assessment_reviews ADD COLUMN reviewer_user_id UUID REFERENCES lms."user"(id) ON DELETE SET NULL;

CREATE TABLE lms.course_version_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_version_id UUID NOT NULL REFERENCES lms.course_versions(id) ON DELETE RESTRICT,
  reviewer_user_id UUID REFERENCES lms."user"(id) ON DELETE SET NULL,
  reviewer_name TEXT NOT NULL CHECK (length(trim(reviewer_name)) BETWEEN 1 AND 160),
  decision TEXT NOT NULL CHECK (decision IN ('approved','changes_requested')),
  notes TEXT NOT NULL CHECK (length(trim(notes)) BETWEEN 1 AND 10000),
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX course_version_reviews_latest_idx ON lms.course_version_reviews(course_version_id,reviewed_at DESC);

CREATE FUNCTION lms.prevent_course_review_mutation() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Course review records are append-only.';
END;
$$;
CREATE TRIGGER append_only_course_version_reviews
  BEFORE UPDATE OR DELETE ON lms.course_version_reviews
  FOR EACH ROW EXECUTE FUNCTION lms.prevent_course_review_mutation();
GRANT SELECT,INSERT ON lms.course_version_reviews TO lms_app;

ALTER TABLE lms.course_version_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY course_version_reviews_read ON lms.course_version_reviews FOR SELECT
  USING (EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role IN ('admin','course_editor')));
CREATE POLICY course_version_reviews_write ON lms.course_version_reviews FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role IN ('admin','course_editor')));

CREATE TABLE lms.support_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES lms."user"(id) ON DELETE CASCADE,
  subject TEXT NOT NULL CHECK (length(trim(subject)) BETWEEN 4 AND 200),
  message TEXT NOT NULL CHECK (length(trim(message)) BETWEEN 10 AND 5000),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  assigned_admin_id UUID REFERENCES lms."user"(id) ON DELETE SET NULL,
  admin_note TEXT CHECK (admin_note IS NULL OR length(admin_note) <= 5000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
CREATE INDEX support_requests_status_created_idx ON lms.support_requests(status,created_at DESC);
CREATE INDEX support_requests_user_created_idx ON lms.support_requests(user_id,created_at DESC);
ALTER TABLE lms.support_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY support_requests_own_read ON lms.support_requests FOR SELECT USING (user_id=lms.current_learner_id());
CREATE POLICY support_requests_own_insert ON lms.support_requests FOR INSERT WITH CHECK (user_id=lms.current_learner_id());
CREATE POLICY support_requests_staff_read ON lms.support_requests FOR SELECT
  USING (EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role IN ('admin','support')));
CREATE POLICY support_requests_staff_update ON lms.support_requests FOR UPDATE
  USING (EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role IN ('admin','support')))
  WITH CHECK (EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role IN ('admin','support')));
GRANT SELECT,INSERT ON lms.support_requests TO lms_app;
GRANT UPDATE(status,assigned_admin_id,admin_note,updated_at,resolved_at) ON lms.support_requests TO lms_app;

CREATE TABLE lms.mail_delivery_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_type TEXT NOT NULL CHECK (message_type IN ('verification','password_reset')),
  recipient_fingerprint TEXT NOT NULL CHECK (recipient_fingerprint ~ '^[A-F0-9]{64}$'),
  status TEXT NOT NULL CHECK (status IN ('sent','failed')),
  error_code TEXT CHECK (error_code IS NULL OR length(error_code) <= 80),
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX mail_delivery_failures_latest_idx ON lms.mail_delivery_attempts(attempted_at DESC) WHERE status='failed';
ALTER TABLE lms.mail_delivery_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY mail_delivery_record_insert ON lms.mail_delivery_attempts FOR INSERT WITH CHECK (TRUE);
CREATE POLICY mail_delivery_admin_read ON lms.mail_delivery_attempts FOR SELECT
  USING (EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role='admin'));
GRANT SELECT,INSERT ON lms.mail_delivery_attempts TO lms_app;

CREATE POLICY audit_events_admin_read ON lms.audit_events FOR SELECT
  USING (EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role='admin'));
CREATE POLICY enrollments_admin_read ON lms.enrollments FOR SELECT
  USING (EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role='admin'));
CREATE POLICY attempts_admin_read ON lms.assessment_attempts FOR SELECT
  USING (EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role='admin'));

ALTER TABLE lms.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms.course_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms.assessment_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY courses_app_read ON lms.courses FOR SELECT USING (
  status='published' OR is_sandbox OR EXISTS (
    SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role IN ('admin','course_editor'))
  OR EXISTS (SELECT 1 FROM lms.enrollments e WHERE e.course_id=courses.id AND e.user_id=lms.current_learner_id())
);
CREATE POLICY course_versions_app_read ON lms.course_versions FOR SELECT USING (
  status='published' OR EXISTS (
    SELECT 1 FROM lms.enrollments e WHERE e.course_version_id=course_versions.id AND e.user_id=lms.current_learner_id())
  OR EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role IN ('admin','course_editor'))
);
CREATE POLICY modules_app_read ON lms.modules FOR SELECT USING (
  EXISTS (SELECT 1 FROM lms.course_versions v WHERE v.id=modules.course_version_id AND (
    v.status='published' OR EXISTS (SELECT 1 FROM lms.enrollments e WHERE e.course_version_id=v.id AND e.user_id=lms.current_learner_id())
    OR EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role IN ('admin','course_editor'))))
);
CREATE POLICY lessons_app_read ON lms.lessons FOR SELECT USING (
  EXISTS (SELECT 1 FROM lms.modules m JOIN lms.course_versions v ON v.id=m.course_version_id WHERE m.id=lessons.module_id AND (
    v.status='published' OR EXISTS (SELECT 1 FROM lms.enrollments e WHERE e.course_version_id=v.id AND e.user_id=lms.current_learner_id())
    OR EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role IN ('admin','course_editor'))))
);
CREATE POLICY assessments_app_read ON lms.assessments FOR SELECT USING (
  EXISTS (SELECT 1 FROM lms.course_versions v WHERE v.id=assessments.course_version_id AND (
    v.status='published' OR EXISTS (SELECT 1 FROM lms.enrollments e WHERE e.course_version_id=v.id AND e.user_id=lms.current_learner_id())
    OR EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role IN ('admin','course_editor'))))
);
CREATE POLICY assessment_questions_app_read ON lms.assessment_questions FOR SELECT USING (
  EXISTS (SELECT 1 FROM lms.assessments a JOIN lms.course_versions v ON v.id=a.course_version_id WHERE a.id=assessment_questions.assessment_id AND (
    v.status='published' OR EXISTS (SELECT 1 FROM lms.enrollments e WHERE e.course_version_id=v.id AND e.user_id=lms.current_learner_id())
    OR EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role IN ('admin','course_editor'))))
);
CREATE POLICY courses_editor_write ON lms.courses FOR ALL
  USING (EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role IN ('admin','course_editor')))
  WITH CHECK (EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role IN ('admin','course_editor')));
CREATE POLICY course_versions_editor_write ON lms.course_versions FOR ALL
  USING (EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role IN ('admin','course_editor')))
  WITH CHECK (EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role IN ('admin','course_editor')));
CREATE POLICY modules_editor_write ON lms.modules FOR ALL
  USING (EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role IN ('admin','course_editor')))
  WITH CHECK (EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role IN ('admin','course_editor')));
CREATE POLICY lessons_editor_write ON lms.lessons FOR ALL
  USING (EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role IN ('admin','course_editor')))
  WITH CHECK (EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role IN ('admin','course_editor')));
CREATE POLICY assessments_editor_write ON lms.assessments FOR ALL
  USING (EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role IN ('admin','course_editor')))
  WITH CHECK (EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role IN ('admin','course_editor')));
CREATE POLICY assessment_questions_editor_write ON lms.assessment_questions FOR ALL
  USING (EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role IN ('admin','course_editor')))
  WITH CHECK (EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role IN ('admin','course_editor')));

ALTER TABLE lms.assessment_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY assessment_reviews_app_read ON lms.assessment_reviews FOR SELECT
  USING (EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role IN ('admin','course_editor')));
CREATE POLICY assessment_reviews_editor_insert ON lms.assessment_reviews FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=lms.current_learner_id() AND r.role IN ('admin','course_editor')));
GRANT INSERT ON lms.assessment_reviews TO lms_app;

GRANT INSERT,UPDATE ON lms.courses,lms.course_versions,lms.modules,lms.lessons,lms.assessments,lms.assessment_questions TO lms_app;

CREATE OR REPLACE FUNCTION lms.prevent_published_course_content_change() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE version_id UUID;
BEGIN
  IF TG_TABLE_NAME='course_versions' THEN
    IF TG_OP='UPDATE' AND OLD.status='published' AND NEW.status='retired'
      AND (to_jsonb(NEW)-ARRAY['status','updated_at']) IS NOT DISTINCT FROM (to_jsonb(OLD)-ARRAY['status','updated_at']) THEN
      RETURN NEW;
    END IF;
    version_id := COALESCE(OLD.id,NEW.id);
  ELSIF TG_TABLE_NAME='modules' THEN
    version_id := COALESCE(OLD.course_version_id,NEW.course_version_id);
  ELSE
    version_id := lms.version_for_module(COALESCE(OLD.module_id,NEW.module_id));
  END IF;
  IF EXISTS (SELECT 1 FROM lms.course_versions WHERE id=version_id AND status IN ('published','retired')) THEN
    RAISE EXCEPTION 'Published or retired course content is immutable; create a new course version.';
  END IF;
  IF TG_OP='DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION lms.prevent_published_assessment_change() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE assessment_id UUID; version_id UUID;
BEGIN
  IF TG_TABLE_NAME='assessments' THEN
    assessment_id := COALESCE(OLD.id,NEW.id);
    version_id := COALESCE(OLD.course_version_id,NEW.course_version_id);
    IF TG_OP='UPDATE' AND OLD.status='published' AND NEW.status='retired'
      AND (to_jsonb(NEW)-ARRAY['status','updated_at']) IS NOT DISTINCT FROM (to_jsonb(OLD)-ARRAY['status','updated_at']) THEN
      RETURN NEW;
    END IF;
  ELSE
    assessment_id := COALESCE(OLD.assessment_id,NEW.assessment_id);
    SELECT course_version_id INTO version_id FROM lms.assessments WHERE id=assessment_id;
  END IF;
  IF EXISTS (SELECT 1 FROM lms.assessments WHERE id=assessment_id AND status IN ('published','retired'))
     OR EXISTS (SELECT 1 FROM lms.course_versions WHERE id=version_id AND status IN ('published','retired')) THEN
    RAISE EXCEPTION 'Published or retired assessment content is immutable; create a new version.';
  END IF;
  IF TG_OP='DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$;

CREATE FUNCTION lms.publish_course_version(p_version_id UUID,p_actor_id UUID,p_force BOOLEAN DEFAULT FALSE)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,lms AS $$
DECLARE v RECORD;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=p_actor_id AND r.role IN ('admin','course_editor')) THEN
    RAISE EXCEPTION 'A course editor or administrator role is required.';
  END IF;
  SELECT cv.*,c.id AS parent_course_id,c.is_sandbox,c.slug AS course_slug INTO v
    FROM lms.course_versions cv JOIN lms.courses c ON c.id=cv.course_id
    WHERE cv.id=p_version_id FOR UPDATE OF cv,c;
  IF NOT FOUND OR v.status<>'draft' OR v.is_sandbox OR v.review_status<>'approved' THEN
    RAISE EXCEPTION 'Only an approved non-sandbox draft course version can be published.';
  END IF;
  IF v.scheduled_publish_at IS NOT NULL AND v.scheduled_publish_at>now() AND NOT p_force THEN
    RAISE EXCEPTION 'The scheduled publication time has not arrived.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM lms.course_version_reviews r WHERE r.course_version_id=p_version_id AND r.decision='approved'
      AND r.reviewer_user_id IS NOT NULL AND r.reviewer_user_id<>p_actor_id
      AND r.id=(SELECT r2.id FROM lms.course_version_reviews r2 WHERE r2.course_version_id=p_version_id ORDER BY r2.reviewed_at DESC,r2.id DESC LIMIT 1)) THEN
    RAISE EXCEPTION 'A different authorized reviewer must record the latest course approval.';
  END IF;
  IF jsonb_typeof(v.learning_objectives) IS DISTINCT FROM 'array'
      OR v.learning_objectives='[]'::jsonb
      OR jsonb_typeof(v.content_sources) IS DISTINCT FROM 'array'
      OR v.content_sources='[]'::jsonb
      OR v.estimated_minutes IS NULL THEN
    RAISE EXCEPTION 'Course objectives, sources, and estimated effort are required.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM lms.modules WHERE course_version_id=p_version_id)
    OR NOT EXISTS (SELECT 1 FROM lms.modules m JOIN lms.lessons l ON l.module_id=m.id WHERE m.course_version_id=p_version_id) THEN
    RAISE EXCEPTION 'At least one module and lesson are required.';
  END IF;
  IF EXISTS (SELECT 1 FROM lms.modules m LEFT JOIN lms.lessons l ON l.module_id=m.id
      WHERE m.course_version_id=p_version_id GROUP BY m.id HAVING count(l.id)=0) THEN
    RAISE EXCEPTION 'Every module must contain at least one lesson.';
  END IF;
  IF EXISTS (SELECT 1 FROM lms.modules m JOIN lms.lessons l ON l.module_id=m.id
      WHERE m.course_version_id=p_version_id AND CASE WHEN jsonb_typeof(l.content->'blocks')='array'
        THEN jsonb_array_length(l.content->'blocks')=0 ELSE TRUE END) THEN
    RAISE EXCEPTION 'Every lesson needs content blocks before publication.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM lms.assessments a WHERE a.course_version_id=p_version_id AND a.rules->>'kind'='final')
    OR EXISTS (SELECT 1 FROM lms.assessments a WHERE a.course_version_id=p_version_id AND
      (a.status<>'draft' OR a.review_status<>'approved' OR a.content_hash='' OR
       (a.rules->>'kind'='final' AND a.pass_percent IS NULL) OR
       (SELECT count(*) FROM lms.assessment_questions q WHERE q.assessment_id=a.id)<=0 OR
       (SELECT count(*) FROM lms.assessment_questions q WHERE q.assessment_id=a.id)<>COALESCE((a.rules->>'question_count')::integer,0))) THEN
    RAISE EXCEPTION 'All assessments must be complete, approved, versioned, and have their expected question count.';
  END IF;
  IF EXISTS (SELECT 1 FROM lms.assessments a WHERE a.course_version_id=p_version_id AND NOT EXISTS (
      SELECT 1 FROM lms.assessment_reviews ar WHERE ar.assessment_id=a.id AND ar.assessment_version_number=a.version_number
        AND ar.decision='approved' AND ar.reviewer_user_id IS NOT NULL AND ar.reviewer_user_id<>p_actor_id
        AND ar.id=(SELECT ar2.id FROM lms.assessment_reviews ar2 WHERE ar2.assessment_id=a.id ORDER BY ar2.reviewed_at DESC,ar2.id DESC LIMIT 1))) THEN
    RAISE EXCEPTION 'A different authorized reviewer must approve each assessment version.';
  END IF;
  IF EXISTS (SELECT 1 FROM lms.assessments a JOIN lms.assessment_questions q ON q.assessment_id=a.id
      WHERE a.course_version_id=p_version_id AND (q.question_type<>'single_choice'
        OR length(trim(COALESCE(q.prompt->>'text','')))=0
        OR length(trim(COALESCE(q.prompt->>'objective','')))=0
        OR NOT EXISTS (SELECT 1 FROM lms.modules m JOIN lms.lessons l ON l.module_id=m.id
          WHERE m.course_version_id=p_version_id AND l.slug=q.prompt->>'lesson_slug')
        OR CASE WHEN jsonb_typeof(a.rules->'objective_blueprint')='array' THEN NOT EXISTS (
          SELECT 1 FROM jsonb_array_elements(a.rules->'objective_blueprint') objective
          WHERE objective->>'objective'=q.prompt->>'objective') ELSE TRUE END
        OR CASE WHEN jsonb_typeof(q.choices)='array' THEN jsonb_array_length(q.choices)<2 ELSE TRUE END
        OR CASE WHEN jsonb_typeof(q.choices)='array' THEN NOT EXISTS (
          SELECT 1 FROM jsonb_array_elements(q.choices) choice WHERE choice->>'id'=q.answer_key->>'choice_id') ELSE TRUE END)) THEN
    RAISE EXCEPTION 'Every single-choice question must include its keyed choice.';
  END IF;
  UPDATE lms.lessons l SET published=TRUE,updated_at=now() FROM lms.modules m
    WHERE l.module_id=m.id AND m.course_version_id=p_version_id;
  UPDATE lms.assessments SET status='published',updated_at=now() WHERE course_version_id=p_version_id;
  UPDATE lms.course_versions SET status='published',published_at=now(),scheduled_publish_at=NULL,updated_at=now() WHERE id=p_version_id;
  UPDATE lms.courses SET status='published',current_version_id=p_version_id,updated_at=now() WHERE id=v.parent_course_id;
  INSERT INTO lms.audit_events(actor_user_id,action,target_type,target_id,details)
    VALUES(p_actor_id,'course.version_published','course_version',p_version_id::text,jsonb_build_object('course_slug',v.course_slug));
END;
$$;
REVOKE ALL ON FUNCTION lms.publish_course_version(UUID,UUID,BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION lms.publish_course_version(UUID,UUID,BOOLEAN) TO lms_app;

CREATE FUNCTION lms.retire_course_version(p_version_id UUID,p_actor_id UUID,p_reason TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,lms AS $$
DECLARE parent_course UUID; current_version UUID;
BEGIN
  IF length(trim(COALESCE(p_reason,'')))<10 OR length(p_reason)>1000 THEN RAISE EXCEPTION 'A retirement reason of 10 to 1000 characters is required.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM lms.user_roles r WHERE r.user_id=p_actor_id AND r.role='admin') THEN
    RAISE EXCEPTION 'An administrator role is required to retire a course.';
  END IF;
  SELECT course_id INTO parent_course FROM lms.course_versions WHERE id=p_version_id AND status='published' FOR UPDATE;
  IF parent_course IS NULL THEN RAISE EXCEPTION 'Only a published course version can be retired.'; END IF;
  UPDATE lms.course_versions SET status='retired',updated_at=now() WHERE id=p_version_id;
  UPDATE lms.assessments SET status='retired',updated_at=now() WHERE course_version_id=p_version_id AND status='published';
  SELECT current_version_id INTO current_version FROM lms.courses WHERE id=parent_course FOR UPDATE;
  IF current_version=p_version_id THEN UPDATE lms.courses SET status='archived',updated_at=now() WHERE id=parent_course; END IF;
  INSERT INTO lms.audit_events(actor_user_id,action,target_type,target_id,details)
    VALUES(p_actor_id,'course.version_retired','course_version',p_version_id::text,jsonb_build_object('reason',p_reason));
END;
$$;
REVOKE ALL ON FUNCTION lms.retire_course_version(UUID,UUID,TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION lms.retire_course_version(UUID,UUID,TEXT) TO lms_app;

COMMENT ON TABLE lms.support_requests IS 'Authenticated learner requests. Do not submit bank/customer data or passwords.';
COMMENT ON TABLE lms.mail_delivery_attempts IS 'Delivery metadata only; recipient email and message/action URLs are never stored here.';
