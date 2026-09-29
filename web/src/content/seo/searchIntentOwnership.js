// Phase 2 editorial ownership. A query has one preferred answer; supporting
// pages serve narrower checklists and link back to it. This is an on-site
// decision, not a claim about Google's selected canonical or ranking.

function owner(id, primaryQuery, ownerPath, { queryVariants = [], supportingPaths = [], intent } = {}) {
  return Object.freeze({ id, primaryQuery, ownerPath, queryVariants: Object.freeze(queryVariants), supportingPaths: Object.freeze(supportingPaths), intent });
}

export const SEARCH_INTENT_OWNERS = Object.freeze([
  owner('finance-course-hub', 'investment banking operations course', '/courses/', {
    queryVariants: ['finance courses', 'financial operations masterclass', 'job-oriented finance course in India', 'investment banking operations course with placement'],
    supportingPaths: ['/courses/investment-banking-operations/', '/job-oriented-finance-course-india/', '/investment-banking-operations-course-with-placement/'],
    intent: 'The one published Masterclass, its scope and enrolment details.',
  }),
  owner('banking-courses', 'banking courses', '/courses/banking-courses/', { intent: 'Banking course types and fit of operations training.' }),
  owner('banking-and-finance-course', 'banking and finance course', '/courses/banking-and-finance/', {
    queryVariants: ['banking and finance course with placement'], supportingPaths: ['/banking-finance-course-with-placement/'],
    intent: 'Combined course selection, linked to actual support terms.',
  }),
  owner('finance-operations-training', 'finance operations training topics', '/courses/finance-operations-training/', {
    queryVariants: ['finance operations training'], intent: 'Training topics for finance operations roles.',
  }),
  owner('centaur-fees-eligibility', 'finance course fees and eligibility', '/courses/finance-course-fees-eligibility/', {
    queryVariants: ['finance course fees in India', 'finance course eligibility', 'Centaur Careers fees', 'Centaur Careers eligibility'],
    supportingPaths: ['/finance-course-fees-in-india/', '/finance-course-eligibility/'],
    intent: 'The actual programme fee, inclusions and graduate entry rule.',
  }),
  owner('centaur-syllabus', 'finance operations syllabus', '/courses/finance-operations-syllabus/', {
    queryVariants: ['finance course duration', 'Centaur Careers course schedule'], supportingPaths: ['/finance-course-duration/'],
    intent: 'The Masterclass sequence and time commitment.',
  }),
  owner('graduates-course', 'finance course for graduates', '/courses/finance-course-for-graduates/', {
    queryVariants: ['best finance course after graduation'], supportingPaths: ['/best-finance-course-after-graduation/'],
    intent: 'Programme fit for graduates from different backgrounds.',
  }),
  owner('national-access', 'investment banking operations course India', '/india/', {
    queryVariants: ['finance course in India', 'online finance course India', 'finance course in Delhi Bangalore Mumbai Pune Hyderabad'],
    supportingPaths: ['/finance-course-cities-india/'],
    intent: 'Nationwide live online access without extra physical-centre claims.',
  }),
  owner('lucknow-access', 'investment banking course in Lucknow', '/locations/lucknow/', {
    queryVariants: ['finance course in Lucknow', 'finance institute in Lucknow with placement'],
    supportingPaths: ['/finance-institute-lucknow-with-placement/'], intent: 'Verified Lucknow access and support terms.',
  }),
  owner('institute-comparison', 'best finance institute in India', '/compare/best-finance-institutes-india/', {
    queryVariants: ['best finance course in India with placement'], supportingPaths: ['/best-finance-course-in-india-with-placement/'],
    intent: 'Provider comparison based on evidence, without unsupported rankings.',
  }),
  owner('investment-banking-course-comparison', 'best investment banking course in India comparison', '/best-investment-banking-course-india/', {
    queryVariants: ['best investment banking course in India'], intent: 'Investment banking course choice across distinct role paths.',
  }),
  owner('bcom-course-choice', 'best finance course after BCom', '/career-guides/finance-careers-after-graduation/', {
    supportingPaths: ['/best-finance-course-after-bcom/'], intent: 'BCom career directions and course fit.',
  }),
  owner('placement-and-guarantee', 'finance course with job guarantee', '/placements/', {
    queryVariants: ['finance course with placement'],
    supportingPaths: ['/finance-course-with-placement/', '/finance-course-with-job-guarantee/'],
    intent: 'The published placement process, guarantee and written conditions.',
  }),
  owner('online-placement-choice', 'online finance course with placement in India', '/online-finance-course-with-placement/', {
    intent: 'Combined remote learning and placement-process/location questions.',
  }),
  owner('finance-reviews', 'finance institute reviews', '/blog/how-to-evaluate-finance-institute-reviews/', {
    intent: 'How to verify reviews and outcome evidence.',
  }),
  owner('pre-enrolment-questions', 'questions to ask finance institute', '/blog/questions-to-ask-finance-institute-before-enrolling/', {
    queryVariants: ['questions to ask before joining a finance course'], intent: 'Pre-enrolment due diligence.',
  }),
  owner('finance-path-comparison', 'financial modelling course', '/compare/finance-operations-vs-financial-modelling-cfa/', {
    queryVariants: ['finance course vs MBA CFA financial modelling'],
    supportingPaths: ['/finance-course-vs-mba-cfa-financial-modelling/'],
    intent: 'Operations versus modelling and qualification paths.',
  }),
  owner('course-selection', 'investment banking course with placement support', '/career-guides/choosing-finance-career-course/', {
    queryVariants: ['which finance course is right for me'], supportingPaths: ['/which-finance-course-is-right-for-me/'],
    intent: 'Role-first course selection and self-assessment.',
  }),
  owner('banking-operations-jobs-for-freshers', 'back office banking jobs', '/career-guides/back-office-banking-jobs/', {
    queryVariants: ['banking operations jobs for freshers'], intent: 'Beginner role guidance without an active-vacancy claim.',
  }),
  owner('investment-banking-operations-jobs', 'investment banking roles', '/career-guides/investment-banking-operations-roles/', {
    queryVariants: ['investment banking operations jobs'], intent: 'Operations role families and entry requirements.',
  }),
  owner('kyc-analyst-jobs', 'what is KYC in banking', '/career-guides/kyc-aml-analyst/', {
    queryVariants: ['KYC analyst jobs'], intent: 'KYC analyst duties, skills and role fit.',
  }),
  owner('finance-operations-analyst-jobs', 'finance operations career', '/career-guides/finance-operations/', {
    queryVariants: ['finance operations analyst jobs'], intent: 'Finance operations duties and role fit.',
  }),
]);
