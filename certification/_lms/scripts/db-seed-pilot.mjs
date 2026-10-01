import { readFile } from 'node:fs/promises';
import pg from 'pg';
import { assessmentContentHash, getAssessmentDefinitions, validateAssessmentContent } from './assessment-content.mjs';

if (!process.env.DATABASE_URL && !process.env.MIGRATION_DATABASE_URL) {
  try { process.loadEnvFile('.env'); } catch {}
}
if (!process.env.MIGRATION_DATABASE_URL) {
  try { process.loadEnvFile('.env.migration'); } catch {}
}

if (process.env.NODE_ENV !== 'development') {
  console.error('The KYC/AML pilot seed can only run when NODE_ENV=development.');
  process.exit(1);
}
const connectionString = process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('MIGRATION_DATABASE_URL or DATABASE_URL is missing.');
  process.exit(1);
}
const content = JSON.parse(await readFile(new URL('../content/kyc-aml-pilot-v1.json', import.meta.url), 'utf8'));
const { source: assessmentContent, definitions } = await getAssessmentDefinitions();
const validation = await validateAssessmentContent();
if (validation.errors.length) throw new Error(`Assessment content validation failed:\n${validation.errors.join('\n')}`);
const client = new pg.Client({ connectionString, connectionTimeoutMillis: 4000 });
try {
  await client.connect();
  const db = await client.query('SELECT current_database() AS name');
  if (db.rows[0]?.name !== 'centaur_lms') throw new Error('Refusing to seed a database other than centaur_lms.');
  await client.query('BEGIN');
  const c = content.course;
  const course = await client.query(`INSERT INTO lms.courses (slug, title, summary, status, is_sandbox)
    VALUES ($1, $2, $3, 'draft', TRUE)
    ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title, summary=EXCLUDED.summary, status='draft', is_sandbox=TRUE, updated_at=now()
    RETURNING id`, [c.slug, c.title, c.summary]);
  const version = await client.query(`INSERT INTO lms.course_versions
    (course_id, version_number, status, overview, estimated_minutes, independent_practice_minutes, review_status, review_date, reviewer_name,
     learning_objectives, glossary, content_sources, case_packet)
    VALUES ($1, 1, 'draft', $2, $3, $4, 'pending', $5, NULL, $6::jsonb, $7::jsonb, $8::jsonb, $9::jsonb)
    ON CONFLICT (course_id, version_number) DO UPDATE SET status='draft', overview=EXCLUDED.overview,
      estimated_minutes=EXCLUDED.estimated_minutes, independent_practice_minutes=EXCLUDED.independent_practice_minutes,
      review_status='pending', review_date=EXCLUDED.review_date,
      reviewer_name=NULL, learning_objectives=EXCLUDED.learning_objectives, glossary=EXCLUDED.glossary,
      content_sources=EXCLUDED.content_sources, case_packet=EXCLUDED.case_packet, updated_at=now()
    RETURNING id`, [course.rows[0].id, c.overview, c.estimatedMinutes,
    c.independentPracticeMinutes, c.reviewDate, JSON.stringify(c.learningObjectives), JSON.stringify(c.glossary), JSON.stringify(c.references), JSON.stringify(c.casePacket)]);
  const versionId = version.rows[0].id;
  for (let mi = 0; mi < content.modules.length; mi++) {
    const courseModule = content.modules[mi];
    const moduleResult = await client.query(`INSERT INTO lms.modules (course_version_id, slug, title, summary, position)
      VALUES ($1,$2,$3,$4,$5) ON CONFLICT (course_version_id, slug) DO UPDATE SET title=EXCLUDED.title,
      summary=EXCLUDED.summary, position=EXCLUDED.position, updated_at=now() RETURNING id`,
      [versionId, courseModule.slug, courseModule.title, courseModule.summary, mi + 1]);
    for (let li = 0; li < courseModule.lessons.length; li++) {
      const lesson = courseModule.lessons[li];
      const result = await client.query(`INSERT INTO lms.lessons (module_id, slug, title, format, content, position, published)
        VALUES ($1,$2,$3,'text',$4::jsonb,$5,FALSE)
        ON CONFLICT (module_id, slug) DO UPDATE SET title=EXCLUDED.title, format='text', content=EXCLUDED.content,
          position=EXCLUDED.position, published=FALSE, updated_at=now() RETURNING id`,
        [moduleResult.rows[0].id, lesson.slug, lesson.title, JSON.stringify({ blocks: lesson.blocks, minutes: lesson.minutes }), li + 1]);
      lesson.id = result.rows[0].id;
    }
  }
  for (const definition of definitions) {
    const rules = {
      kind: definition.kind,
      module_slug: definition.moduleSlug,
      max_attempts: definition.maxAttempts,
      time_limit_minutes: definition.timeLimitMinutes,
      question_count: definition.questions.length,
      objective_blueprint: definition.blueprint ?? [...new Set(definition.questions.map((question) => question.objective))].map((objective) => ({ objective, count: definition.questions.filter((question) => question.objective === objective).length })),
      feedback: definition.kind === 'final' ? 'objective_summary_without_answer_key' : 'answer_explanations',
    };
    const hash = assessmentContentHash(definition);
    const existing = await client.query(`SELECT id, status, content_hash FROM lms.assessments
      WHERE course_version_id=$1 AND slug=$2 AND version_number=1 FOR UPDATE`, [versionId, definition.slug]);
    let assessmentId;
    if (existing.rowCount) {
      const previous = existing.rows[0];
      if (previous.status !== 'draft') throw new Error(`Assessment ${definition.slug} is not a draft; create a new version instead of reseeding it.`);
      if (previous.content_hash !== hash) {
        const attempts = await client.query('SELECT count(*)::int AS total FROM lms.assessment_attempts WHERE assessment_id=$1', [previous.id]);
        const reviews = await client.query('SELECT count(*)::int AS total FROM lms.assessment_reviews WHERE assessment_id=$1', [previous.id]);
        if (attempts.rows[0].total > 0 || reviews.rows[0].total > 0) throw new Error(`Assessment ${definition.slug} v1 has learner attempts or review history; preserve it and create a new assessment version.`);
        await client.query('DELETE FROM lms.assessment_questions WHERE assessment_id=$1', [previous.id]);
        await client.query(`UPDATE lms.assessments SET title=$2, status='draft', pass_percent=$3, rules=$4::jsonb,
          review_status='pending', review_date=$5, reviewer_name=NULL, content_hash=$6, updated_at=now() WHERE id=$1`,
        [previous.id, definition.title, definition.passPercent ?? null, JSON.stringify(rules), assessmentContent.reviewDate, hash]);
      }
      assessmentId = previous.id;
    } else {
      const inserted = await client.query(`INSERT INTO lms.assessments
        (course_version_id, slug, title, version_number, status, pass_percent, rules, review_status, review_date, content_hash)
        VALUES ($1,$2,$3,1,'draft',$4,$5::jsonb,'pending',$6,$7) RETURNING id`,
      [versionId, definition.slug, definition.title, definition.passPercent ?? null, JSON.stringify(rules), assessmentContent.reviewDate, hash]);
      assessmentId = inserted.rows[0].id;
    }
    const questionCount = await client.query('SELECT count(*)::int AS total FROM lms.assessment_questions WHERE assessment_id=$1', [assessmentId]);
    if (questionCount.rows[0].total === 0) {
      for (let qi = 0; qi < definition.questions.length; qi++) {
        const question = definition.questions[qi];
        await client.query(`INSERT INTO lms.assessment_questions
          (assessment_id, position, question_type, prompt, choices, answer_key, explanation)
          VALUES ($1,$2,'single_choice',$3::jsonb,$4::jsonb,$5::jsonb,$6::jsonb)`,
        [assessmentId, qi + 1, JSON.stringify({ text: question.prompt, objective: question.objective, lesson_slug: question.lessonSlug }),
          JSON.stringify(question.choices), JSON.stringify({ choice_id: question.answer }), JSON.stringify({ text: question.explanation })]);
      }
    } else if (questionCount.rows[0].total !== definition.questions.length) {
      throw new Error(`Assessment ${definition.slug} has a partial question set; repair the local draft before use.`);
    }
  }
  await client.query('UPDATE lms.courses SET current_version_id=$2 WHERE id=$1', [course.rows[0].id, versionId]);
  await client.query('COMMIT');
  console.log(`Seeded ${c.slug} v1 as a local-only draft: ${content.modules.length} modules, ${content.modules.reduce((n, m) => n + m.lessons.length, 0)} text lessons, ${definitions.length} draft assessments. Reviewer approval is pending.`);
} catch (error) {
  await client.query('ROLLBACK').catch(() => {});
  console.error(error instanceof Error ? error.message : 'Pilot seed failed.');
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
