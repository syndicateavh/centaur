import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

const readJson = async (path) => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));

export async function getAssessmentDefinitions() {
  const source = await readJson('../content/kyc-aml-assessment-v1.json');
  return {
    source,
    definitions: [
      ...source.knowledgeChecks.map((definition) => ({
        ...definition,
        kind: 'knowledge_check',
        passPercent: 100,
        maxAttempts: 20,
        timeLimitMinutes: null,
      })),
      { ...source.finalAssessment, kind: 'final' },
    ],
  };
}

export function assessmentContentHash(definition) {
  return createHash('sha256').update(JSON.stringify(definition)).digest('hex');
}

export async function validateAssessmentContent() {
  const [{ source, definitions }, course] = await Promise.all([
    getAssessmentDefinitions(),
    readJson('../content/kyc-aml-pilot-v1.json'),
  ]);
  const errors = [];
  const objectives = new Set(course.course.learningObjectives.map((_, index) => `O${index + 1}`));
  const lessons = new Set(course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.slug)));
  const modules = new Set(course.modules.map((module) => module.slug));

  if (source.reviewStatus !== 'pending') errors.push('Assessment source must remain pending until qualified review is recorded.');
  if (source.knowledgeChecks.length !== 5) errors.push(`Expected five formative checks; found ${source.knowledgeChecks.length}.`);

  const slugs = new Set();
  for (const definition of definitions) {
    if (slugs.has(definition.slug)) errors.push(`${definition.slug}: duplicate assessment slug.`);
    slugs.add(definition.slug);
    if (!definition.title?.trim()) errors.push(`${definition.slug}: title is required.`);
    if (definition.kind === 'knowledge_check' && !modules.has(definition.moduleSlug)) errors.push(`${definition.slug}: unknown module ${definition.moduleSlug}.`);
    if (definition.kind === 'knowledge_check' && definition.questions.length !== 2) errors.push(`${definition.slug}: formative checks must contain exactly two questions.`);
    if (definition.kind === 'final' && (definition.questions.length !== 15 || definition.questionCount !== 15)) errors.push('Final assessment must contain exactly 15 questions.');

    definition.questions.forEach((question, index) => {
      const at = `${definition.slug}, question ${index + 1}`;
      if (!question.prompt?.trim()) errors.push(`${at}: prompt is required.`);
      if (!question.explanation?.trim()) errors.push(`${at}: explanation is required.`);
      if (!objectives.has(question.objective)) errors.push(`${at}: unknown objective ${question.objective}.`);
      if (!lessons.has(question.lessonSlug)) errors.push(`${at}: unknown lesson ${question.lessonSlug}.`);
      if (!Array.isArray(question.choices) || question.choices.length !== 4) errors.push(`${at}: exactly four choices are required.`);
      const choiceIds = new Set(question.choices?.map((choice) => choice.id));
      if (choiceIds.size !== question.choices?.length) errors.push(`${at}: choice IDs must be unique.`);
      if (question.choices?.some((choice) => !choice.id?.trim() || !choice.text?.trim())) errors.push(`${at}: every choice needs an ID and text.`);
      if (!choiceIds.has(question.answer)) errors.push(`${at}: answer must reference one of its choices.`);
    });

    if (definition.kind === 'final') {
      const blueprint = new Map(definition.blueprint.map((item) => [item.objective, item.count]));
      const actual = new Map();
      for (const question of definition.questions) actual.set(question.objective, (actual.get(question.objective) ?? 0) + 1);
      if (blueprint.size !== objectives.size || [...objectives].some((objective) => blueprint.get(objective) !== 3)) {
        errors.push('Final blueprint must assign exactly three questions to each course objective.');
      }
      if ([...blueprint].some(([objective, count]) => actual.get(objective) !== count) || actual.size !== blueprint.size) {
        errors.push('Final question objective counts do not match the declared blueprint.');
      }
      if (definition.passPercent !== 80 || definition.maxAttempts !== 3 || definition.timeLimitMinutes !== null) {
        errors.push('Final rules must remain 80% to pass, three attempts, and untimed.');
      }
    }
  }

  return { errors, definitions };
}
