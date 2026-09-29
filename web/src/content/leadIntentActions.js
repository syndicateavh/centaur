// A concrete next step for each root-level decision page. These requests ask
// for current written details; they do not imply eligibility or a job outcome.
export const LEAD_INTENT_ACTIONS = Object.freeze({
  'lead-best-finance-course-placement': ['Compare placement support', 'Ask for the current support scope and written cohort terms.', '/placements/#job-guarantee-terms'],
  'lead-best-investment-banking-course-india': ['Check operations role fit', 'Ask which operations workflows and practice tasks are in the current syllabus.', '/courses/'],
  'lead-best-finance-course-after-graduation': ['Check graduate fit', 'Ask about eligibility, practice work, and the next cohort for graduates.', '/courses/finance-course-for-graduates/'],
  'lead-best-finance-course-after-bcom': ['Check BCom fit', 'Ask which operations roles and prerequisites match your background.', '/career-guides/finance-careers-after-graduation/'],
  'lead-finance-course-placement': ['Review support terms', 'Read the published placement summary and request current written terms.', '/placements/#job-guarantee-terms'],
  'lead-finance-course-job-guarantee': ['Read guarantee conditions', 'Check the published scope, conditions, and exclusions before asking about a cohort.', '/placements/#job-guarantee-terms'],
  'lead-finance-course-fees-india': ['Check the full cost', 'Confirm the current fee, payment schedule, and refund terms in writing.', '/courses/finance-course-fees-eligibility/'],
  'lead-finance-course-duration': ['Check the next schedule', 'Confirm dates, live hours, practice time, and attendance expectations.', '/courses/finance-operations-syllabus/'],
  'lead-finance-course-eligibility': ['Check your eligibility', 'Confirm course admission criteria and any separate job conditions.', '/courses/finance-course-fees-eligibility/'],
  'lead-online-finance-course-placement': ['Ask about online access', 'Confirm live-session times, practice access, and current support terms.', '/india/'],
  'lead-job-oriented-finance-course-india': ['Review the syllabus', 'Compare the current modules and practical tasks with your target role.', '/courses/'],
  'lead-banking-finance-course-placement': ['Choose a banking path', 'Check which banking operations topics and support terms apply.', '/courses/banking-and-finance/'],
  'lead-investment-banking-operations-course-placement': ['Check module fit', 'Ask about settlements, reconciliation, and the role scope of this module.', '/courses/investment-banking-operations/'],
  'lead-finance-institute-lucknow-placement': ['Confirm Lucknow access', 'Check the published training location, cohort schedule, and written support terms.', '/locations/lucknow/'],
  'lead-finance-course-cities-india': ['Confirm access from your city', 'Ask about the live online schedule; the published in-person option is in Lucknow.', '/india/'],
  'lead-finance-course-vs-mba-cfa-modelling': ['Compare learning goals', 'Use the role and course checklist before choosing a pathway.', '/compare/finance-operations-vs-financial-modelling-cfa/'],
  'lead-which-finance-course-right': ['Check your role fit', 'Use the course selection checklist and ask about your preferred role.', '/career-guides/choosing-finance-career-course/'],
});

export function getLeadIntentAction(pageId) {
  const action = LEAD_INTENT_ACTIONS[pageId];
  return action ? Object.freeze({ title: action[0], description: action[1], path: action[2] }) : null;
}
