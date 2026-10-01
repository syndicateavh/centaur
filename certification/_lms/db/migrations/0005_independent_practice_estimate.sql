ALTER TABLE lms.course_versions
  ADD COLUMN independent_practice_minutes INTEGER NOT NULL DEFAULT 0
    CHECK (independent_practice_minutes >= 0);

COMMENT ON COLUMN lms.course_versions.independent_practice_minutes IS
  'Estimated versioned self-study time outside lesson pages, such as an offline workbook.';
