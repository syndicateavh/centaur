// A concrete next step for each root-level decision page. These requests ask
// for current written details; they do not imply eligibility or a job outcome.
export const LEAD_INTENT_ACTIONS = Object.freeze({
  'lead-best-finance-course-placement': ['Compare placement support', 'Ask for the current support scope and written cohort terms.', '/placements/#job-guarantee-terms'],
  'lead-best-investment-banking-course-india': ['Check operations role fit', 'Ask which operations workflows and practice tasks are in the current syllabus.', '/courses/'],
  'lead-best-finance-course-after-graduation': ['Check graduate fit', 'Ask about eligibility, practice work, and the next cohort for graduates.', '/courses/finance-course-for-graduates/'],
  'lead-best-finance-course-after-bcom': ['Check BCom fit', 'Ask which operations roles and prerequisites match your background.', '/career-guides/finance-careers-after-graduation/'],
  'lead-finance-course-placement': ['Review support terms', 'Read the published placement summary and request current written terms.', '/placements/#job-guarantee-terms'],
  'lead-finance-course-job-guarantee': ['Review the guarantee summary', 'Read Centaur Careers’ approved public promise and request the complete current written cohort terms.', '/placements/#job-guarantee-terms'],
  'lead-finance-course-fees-india': ['Check the full cost', 'Review Centaur Careers’ published fees, then confirm fee validity, total payable amount, and refund terms in writing.', '/courses/finance-course-fees-eligibility/'],
  'lead-finance-course-duration': ['Check the published syllabus', 'Review the program duration and learning sequence, then confirm the current cohort schedule and workload.', '/courses/finance-operations-syllabus/'],
  'lead-finance-course-eligibility': ['Review course entry criteria', 'Check Centaur Careers’ published graduation entry rule and confirm cohort-specific documents with the team.', '/courses/finance-course-fees-eligibility/'],
  'lead-online-finance-course-placement': ['Ask about online access', 'Confirm live-session times, practice access, and current support terms.', '/india/'],
  'lead-job-oriented-finance-course-india': ['Review the syllabus', 'Compare the current modules and practical tasks with your target role.', '/courses/'],
  'lead-banking-finance-course-placement': ['Choose a banking path', 'Check which banking operations topics and support terms apply.', '/courses/banking-and-finance/'],
  'lead-investment-banking-operations-course-placement': ['Check module fit', 'Ask about settlements, reconciliation, and the role scope of this module.', '/courses/investment-banking-operations/'],
  'lead-finance-institute-lucknow-placement': ['Confirm Lucknow access', 'Check the published training location, cohort schedule, and written support terms.', '/locations/lucknow/'],
  'lead-finance-course-cities-india': ['Confirm access from your city', 'Ask about the live online schedule; the published in-person option is in Lucknow.', '/india/'],
  'lead-finance-course-vs-mba-cfa-modelling': ['Compare learning goals', 'Use the role and course checklist before choosing a pathway.', '/compare/finance-operations-vs-financial-modelling-cfa/'],
  'lead-which-finance-course-right': ['Check your role fit', 'Use the course selection checklist and ask about your preferred role.', '/career-guides/choosing-finance-career-course/'],
});

// Each root-level decision page points to the existing owner for its broader
// search intent or the Centaur page that publishes the related program fact.
const LEAD_INTENT_SOURCE_PAGES = Object.freeze({
  'finance-operations-syllabus': Object.freeze([
    ['Check the workload and schedule questions', '/finance-course-duration/'],
    ['Check fees and graduation entry', '/courses/finance-course-fees-eligibility/'],
    ['Ask questions before enrolling', '/blog/questions-to-ask-finance-institute-before-enrolling/'],
  ]),
  'finance-course-fees-eligibility': Object.freeze([
    ['Use the total-cost comparison checklist', '/finance-course-fees-in-india/'],
    ['Use the course-entry checklist', '/finance-course-eligibility/'],
    ['Read the refund and cancellation policy', '/refund-cancellation-policy/'],
    ['Read the syllabus and duration', '/courses/finance-operations-syllabus/'],
  ]),
  'lead-best-finance-course-placement': Object.freeze([
    ['Compare providers and written evidence', '/compare/best-finance-institutes-india/'],
    ['Read Centaur Careers placement terms', '/placements/#job-guarantee-terms'],
    ['Use the questions-before-enrolling checklist', '/blog/questions-to-ask-finance-institute-before-enrolling/'],
  ]),
  'lead-best-investment-banking-course-india': Object.freeze([
    ['Review the Financial Operations Masterclass', '/courses/'],
    ['Compare investment banking operations courses', '/compare/investment-banking-operations-courses/'],
    ['Read the investment banking operations career guide', '/career-guides/investment-banking-operations/'],
  ]),
  'lead-best-finance-course-after-graduation': Object.freeze([
    ['Review the finance course for graduates', '/courses/finance-course-for-graduates/'],
    ['Read the finance operations syllabus', '/courses/finance-operations-syllabus/'],
    ['Check fees and course entry', '/courses/finance-course-fees-eligibility/'],
  ]),
  'lead-best-finance-course-after-bcom': Object.freeze([
    ['Read finance careers after graduation', '/career-guides/finance-careers-after-graduation/'],
    ['Review the finance course for graduates', '/courses/finance-course-for-graduates/'],
    ['Use the course selection guide', '/career-guides/choosing-finance-career-course/'],
  ]),
  'lead-finance-course-placement': Object.freeze([
    ['Read Centaur Careers placement terms', '/placements/#job-guarantee-terms'],
    ['Review the Masterclass scope', '/courses/'],
    ['Ask questions before enrolling', '/blog/questions-to-ask-finance-institute-before-enrolling/'],
  ]),
  'lead-finance-course-job-guarantee': Object.freeze([
    ['Read the Job Guarantee Program summary', '/placements/#job-guarantee-terms'],
    ['Check fees and graduation entry', '/courses/finance-course-fees-eligibility/'],
    ['Ask questions before enrolling', '/blog/questions-to-ask-finance-institute-before-enrolling/'],
  ]),
  'lead-finance-course-fees-india': Object.freeze([
    ['Check Centaur Careers’ published fees and entry rule', '/courses/finance-course-fees-eligibility/'],
    ['Read the refund and cancellation policy', '/refund-cancellation-policy/'],
    ['Ask questions before enrolling', '/blog/questions-to-ask-finance-institute-before-enrolling/'],
  ]),
  'lead-finance-course-duration': Object.freeze([
    ['Read the finance operations syllabus', '/courses/finance-operations-syllabus/'],
    ['Review the full Masterclass', '/courses/'],
    ['Ask questions before enrolling', '/blog/questions-to-ask-finance-institute-before-enrolling/'],
  ]),
  'lead-finance-course-eligibility': Object.freeze([
    ['Check Centaur Careers’ published fees and entry rule', '/courses/finance-course-fees-eligibility/'],
    ['Explore finance courses for graduates', '/courses/finance-course-for-graduates/'],
    ['Ask questions before enrolling', '/blog/questions-to-ask-finance-institute-before-enrolling/'],
  ]),
  'lead-online-finance-course-placement': Object.freeze([
    ['Check nationwide online access', '/india/'],
    ['Review the Financial Operations Masterclass', '/courses/'],
    ['Read Centaur Careers placement terms', '/placements/#job-guarantee-terms'],
  ]),
  'lead-job-oriented-finance-course-india': Object.freeze([
    ['Review the Financial Operations Masterclass', '/courses/'],
    ['Read the current syllabus', '/courses/finance-operations-syllabus/'],
    ['Read Centaur Careers placement terms', '/placements/#job-guarantee-terms'],
  ]),
  'lead-banking-finance-course-placement': Object.freeze([
    ['Review the banking and finance course', '/courses/banking-and-finance/'],
    ['Read Centaur Careers placement terms', '/placements/#job-guarantee-terms'],
    ['Ask questions before enrolling', '/blog/questions-to-ask-finance-institute-before-enrolling/'],
  ]),
  'lead-investment-banking-operations-course-placement': Object.freeze([
    ['Review the Financial Operations Masterclass', '/courses/'],
    ['Explore the Investment Banking Operations module', '/courses/investment-banking-operations/'],
    ['Read Centaur Careers placement terms', '/placements/#job-guarantee-terms'],
  ]),
  'lead-finance-institute-lucknow-placement': Object.freeze([
    ['Check the published Lucknow location', '/locations/lucknow/'],
    ['Check fees and graduation entry', '/courses/finance-course-fees-eligibility/'],
    ['Read Centaur Careers placement terms', '/placements/#job-guarantee-terms'],
  ]),
  'lead-finance-course-cities-india': Object.freeze([
    ['Check nationwide online access', '/india/'],
    ['Review the published Lucknow location', '/locations/lucknow/'],
    ['Review current program details', '/courses/'],
  ]),
  'lead-finance-course-vs-mba-cfa-modelling': Object.freeze([
    ['Compare finance operations and other pathways', '/compare/finance-operations-vs-financial-modelling-cfa/'],
    ['Review the Financial Operations Masterclass', '/courses/'],
    ['Read the questions-before-enrolling checklist', '/blog/questions-to-ask-finance-institute-before-enrolling/'],
  ]),
  'lead-which-finance-course-right': Object.freeze([
    ['Use the course selection guide', '/career-guides/choosing-finance-career-course/'],
    ['Review the Financial Operations Masterclass', '/courses/'],
    ['Ask questions before enrolling', '/blog/questions-to-ask-finance-institute-before-enrolling/'],
  ]),
});

export function getLeadIntentAction(pageId) {
  const action = LEAD_INTENT_ACTIONS[pageId];
  return action ? Object.freeze({ title: action[0], description: action[1], path: action[2] }) : null;
}

export function getLeadIntentSourcePages(pageId) {
  return (LEAD_INTENT_SOURCE_PAGES[pageId] || []).map(([label, path]) => Object.freeze({ label, path }));
}
