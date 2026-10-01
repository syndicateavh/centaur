import { validateAssessmentContent } from './assessment-content.mjs';

const { errors, definitions } = await validateAssessmentContent();
if (errors.length) {
  console.error('Assessment content validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Assessment content is structurally valid: ${definitions.length} assessments, ${definitions.reduce((total, item) => total + item.questions.length, 0)} questions.`);
}
