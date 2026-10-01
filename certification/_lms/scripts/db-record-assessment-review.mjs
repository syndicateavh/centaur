import pg from 'pg';
import { assessmentContentHash, getAssessmentDefinitions, validateAssessmentContent } from './assessment-content.mjs';

function option(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index < 0 ? null : process.argv[index + 1] ?? null;
}

const reviewer = option('reviewer')?.trim();
const decision = option('decision');
const notes = option('notes')?.trim();
const assessmentSlug = option('assessment')?.trim();
if (process.env.NODE_ENV !== 'development') throw new Error('Review decisions can only be recorded in the local development environment.');
if (!reviewer || reviewer.length > 160 || !notes || notes.length > 10000 || !assessmentSlug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(assessmentSlug)) {
  throw new Error('Provide --reviewer, --assessment, --decision, and --notes.');
}
if (decision !== 'approved' && decision !== 'changes_requested') throw new Error('--decision must be approved or changes_requested.');
const validation = await validateAssessmentContent();
if (validation.errors.length) throw new Error(`Assessment content validation failed:\n${validation.errors.join('\n')}`);
const { definitions } = await getAssessmentDefinitions();
const definition = definitions.find((item) => item.slug === assessmentSlug);
if (!definition) throw new Error(`Assessment ${assessmentSlug} is not present in the reviewed source file.`);
if (!process.env.DATABASE_URL && !process.env.MIGRATION_DATABASE_URL) {
  try { process.loadEnvFile('.env'); } catch {}
}
if (!process.env.MIGRATION_DATABASE_URL) {
  try { process.loadEnvFile('.env.migration'); } catch {}
}
const connectionString = process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL;
if (!connectionString) throw new Error('MIGRATION_DATABASE_URL or DATABASE_URL is missing.');

const client = new pg.Client({ connectionString, connectionTimeoutMillis: 4000 });
try {
  await client.connect();
  const db = await client.query('SELECT current_database() AS name');
  if (db.rows[0]?.name !== 'centaur_lms') throw new Error('Refusing to record a review outside centaur_lms.');
  await client.query('BEGIN');
  const result = await client.query(`SELECT a.id,a.version_number,a.status,a.content_hash,a.rules,
      (a.rules->>'question_count')::int AS expected,
      (SELECT count(*)::int FROM lms.assessment_questions q WHERE q.assessment_id=a.id) AS actual
    FROM lms.courses c JOIN lms.course_versions v ON v.id=c.current_version_id
    JOIN lms.assessments a ON a.course_version_id=v.id
    WHERE c.slug='kyc-aml-operations-pilot' AND c.is_sandbox=TRUE AND a.slug=$1
    FOR UPDATE OF a`, [assessmentSlug]);
  const assessment = result.rows[0];
  if (!assessment) throw new Error('Assessment not found in the current local pilot version.');
  if (assessment.status !== 'draft') throw new Error('Only draft assessments can receive review decisions.');
  if (assessment.content_hash !== assessmentContentHash(definition)) throw new Error('Database assessment content is stale. Reseed the local pilot before recording a review.');
  if (assessment.expected !== assessment.actual) throw new Error(`Question count mismatch: expected ${assessment.expected}, found ${assessment.actual}.`);
  const questionRows = await client.query(`SELECT position,prompt,choices,answer_key,explanation
    FROM lms.assessment_questions WHERE assessment_id=$1 ORDER BY position`, [assessment.id]);
  for (const [index, question] of definition.questions.entries()) {
    const stored = questionRows.rows[index];
    if (!stored || stored.position !== index + 1 || stored.prompt.text !== question.prompt
      || stored.prompt.objective !== question.objective || stored.prompt.lesson_slug !== question.lessonSlug
      || JSON.stringify(stored.choices) !== JSON.stringify(question.choices)
      || stored.answer_key.choice_id !== question.answer
      || stored.explanation.text !== question.explanation) {
      throw new Error(`Database content for ${assessmentSlug} question ${index + 1} does not match the reviewed source. Reseed before recording a review.`);
    }
  }
  await client.query(`INSERT INTO lms.assessment_reviews (assessment_id,assessment_version_number,reviewer_name,decision,notes)
    VALUES ($1,$2,$3,$4,$5)`, [assessment.id, assessment.version_number, reviewer, decision, notes]);
  await client.query(`UPDATE lms.assessments SET review_status=$2,review_date=current_date,reviewer_name=$3,updated_at=now() WHERE id=$1`,
    [assessment.id, decision, reviewer]);
  await client.query('COMMIT');
  console.log(`Recorded ${decision} for ${assessmentSlug} v${assessment.version_number}. Assessment publication state remains draft.`);
} catch (error) {
  await client.query('ROLLBACK').catch(() => {});
  console.error(error instanceof Error ? error.message : 'Could not record assessment review.');
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
