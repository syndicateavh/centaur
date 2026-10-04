// Phase 2 editorial ownership. A query has one preferred answer; supporting
// pages serve narrower checklists and link back to it. This is an on-site
// decision, not a claim about Google's selected canonical or ranking.

function owner(id, primaryQuery, ownerPath, { queryVariants = [], supportingPaths = [], intent } = {}) {
  return Object.freeze({ id, primaryQuery, ownerPath, queryVariants: Object.freeze(queryVariants), supportingPaths: Object.freeze(supportingPaths), intent });
}

export const SEARCH_INTENT_OWNERS = Object.freeze([
  owner('finance-course-hub', 'financial operations masterclass', '/courses/', {
    queryVariants: ['finance operations course', 'financial operations course', 'finance operations course with placement', 'finance operations course in India', 'financial operations training for graduates', 'job-oriented finance course in India'],
    supportingPaths: ['/courses/investment-banking-operations/', '/job-oriented-finance-course-india/', '/investment-banking-operations-course-with-placement/'],
    intent: 'The one published Masterclass, its scope and enrolment details.',
  }),
  owner('banking-courses', 'banking courses', '/courses/banking-courses/', {
    queryVariants: ['banking operations course', 'bank operations training', 'banking operations course with placement'],
    intent: 'Banking course types and fit of operations training, connected to the published Masterclass modules.',
  }),
  owner('retail-banking-course', 'retail banking operations course', '/courses/retail-banking/', {
    queryVariants: ['retail banking operations training'], supportingPaths: ['/career-guides/retail-banking-operations/'],
    intent: 'Retail banking subjects within the Financial Operations Masterclass and the distinct retail-banking role guide.',
  }),
  owner('banking-and-finance-course', 'banking and finance course', '/courses/banking-and-finance/', {
    queryVariants: ['banking and finance course with placement'], supportingPaths: ['/banking-finance-course-with-placement/'],
    intent: 'Combined course selection, linked to actual support terms.',
  }),
  owner('finance-operations-training', 'finance operations training topics', '/courses/finance-operations-training/', {
    queryVariants: ['finance operations training'], intent: 'Training topics for finance operations roles.',
  }),
  owner('centaur-fees-eligibility', 'finance course fees and eligibility', '/courses/finance-course-fees-eligibility/', {
    queryVariants: ['finance course fees in India', 'finance course eligibility', 'investment banking course fees', 'investment banking course fees in India', 'investment banking operations course fees', 'investment banking course cost', 'investment banking training fees', 'online investment banking course fees', 'Centaur Careers fees', 'Centaur Careers eligibility'],
    supportingPaths: ['/finance-course-fees-in-india/', '/finance-course-eligibility/'],
    intent: 'The actual programme fee, inclusions and graduate entry rule.',
  }),
  owner('centaur-syllabus', 'finance operations syllabus', '/courses/finance-operations-syllabus/', {
    queryVariants: ['finance course duration', 'investment banking course duration', 'investment banking operations course duration', 'short term investment banking course', 'six week finance course', 'Centaur Careers course schedule'], supportingPaths: ['/finance-course-duration/'],
    intent: 'The Masterclass sequence and time commitment.',
  }),
  owner('graduates-course', 'finance course for graduates', '/courses/finance-course-for-graduates/', {
    queryVariants: ['finance course after graduation', 'best finance course after graduation', 'finance course after graduation with placement', 'finance training after graduation', 'finance course after BA with placement', 'finance course after BSc with placement', 'finance course after BBA with placement', 'finance course after BCA with placement', 'investment banking after BCom', 'investment banking after BBA', 'investment banking after MBA'], supportingPaths: ['/best-finance-course-after-graduation/'],
    intent: 'Programme fit for graduates from different backgrounds.',
  }),
  owner('btech-finance-course', 'finance course after BTech with placement', '/best-finance-course-after-graduation/', {
    queryVariants: ['finance course after BTech', 'finance course for engineers', 'finance course for engineering graduates with placement', 'finance jobs after BTech', 'finance career after engineering', 'investment banking after BTech', 'banking career after BTech', 'finance course for non-commerce graduates with placement', 'finance career for non-commerce students', 'banking jobs for non-commerce graduates', 'finance jobs without commerce degree', 'investment banking for non-commerce graduates'],
    supportingPaths: ['/courses/finance-course-for-graduates/', '/career-guides/finance-careers-after-graduation/'],
    intent: 'BTech and non-commerce graduates comparing a realistic finance-operations transition path.',
  }),
  owner('investment-banking-course-mumbai', 'investment banking course in Mumbai', '/india/mumbai/', {
    queryVariants: ['investment banking operations course in Mumbai', 'finance course in Mumbai with placement', 'KYC AML course in Mumbai with placement'], supportingPaths: ['/courses/investment-banking-operations/', '/courses/kyc-aml/'],
    intent: 'Mumbai online access to finance operations modules and market-specific role research, without claiming a local classroom or job.',
  }),
  owner('investment-banking-course-bengaluru', 'investment banking course in Bangalore', '/india/bengaluru/', {
    queryVariants: ['investment banking operations course in Bangalore with placement', 'investment banking operations course Bengaluru placement'], supportingPaths: ['/courses/investment-banking-operations/', '/career-guides/investment-banking-operations/'],
    intent: 'Bengaluru online course access and role research without claiming a Bengaluru classroom or job.',
  }),
  owner('investment-banking-course-delhi', 'investment banking course in Delhi', '/india/delhi-ncr/', {
    queryVariants: ['banking operations course in Delhi with placement', 'finance operations course Delhi NCR placement'], supportingPaths: ['/courses/banking-and-finance/', '/career-guides/finance-operations/'],
    intent: 'Delhi-NCR online access to banking and finance operations learning, with accurate placement geography.',
  }),
  owner('finance-course-pune', 'investment banking course in Pune', '/india/pune/', {
    queryVariants: ['finance course in Pune with placement', 'online finance course in Pune'],
    intent: 'Pune live-online access and regional career research without claiming a Pune classroom or job.',
  }),
  owner('finance-course-hyderabad', 'investment banking course in Hyderabad', '/india/hyderabad/', {
    queryVariants: ['finance course in Hyderabad with placement', 'online finance course in Hyderabad'],
    intent: 'Hyderabad live-online access and regional career research without claiming a Hyderabad classroom or job.',
  }),
  owner('national-access', 'finance career training India', '/india/', {
    queryVariants: ['finance course in India', 'online finance course in India', 'live online finance training India', 'finance course in Delhi Bangalore Mumbai Pune Hyderabad'],
    supportingPaths: ['/finance-course-cities-india/'],
    intent: 'Nationwide live online access without extra physical-centre claims.',
  }),
  owner('lucknow-access', 'investment banking course in Lucknow', '/locations/lucknow/', {
    queryVariants: ['finance course in Lucknow', 'finance institute in Lucknow with placement'],
    supportingPaths: ['/finance-institute-lucknow-with-placement/'], intent: 'Verified Lucknow access and support terms.',
  }),
  owner('investment-banking-operations-module', 'investment banking operations module', '/courses/investment-banking-operations/', {
    queryVariants: ['investment banking operations course', 'investment banking operations training', 'investment banking operations course in India', 'investment banking operations course online', 'investment banking operations for freshers', 'investment banking operations certification', 'investment banking operations training with placement', 'investment banking operations course with placement', 'investment banking course with placement', 'investment banking course with job guarantee', 'investment banking training with placement', 'investment banking course for freshers', 'investment banking course after graduation', 'fund accounting course', 'fund accounting jobs', 'fund accounting for freshers', 'fund accounting analyst', 'fund accounting analyst career', 'investment fund operations', 'corporate actions course'],
    supportingPaths: ['/courses/', '/investment-banking-operations-course-with-placement/', '/career-guides/investment-banking-operations/', '/career-guides/trade-lifecycle/', '/resources/corporate-actions-workflow/', '/blog/fund-accounting-nav-workflow-career-skills/'],
    intent: 'Specific investment-banking operations module coverage inside the single Masterclass, without implying separate certification or front-office training.',
  }),
  owner('kyc-aml-course', 'KYC AML course', '/courses/kyc-aml/', {
    queryVariants: ['KYC AML certification course', 'KYC AML training', 'KYC AML course in India', 'KYC AML course online', 'KYC AML course with placement assistance', 'AML KYC analyst course', 'KYC analyst course', 'AML analyst course', 'KYC AML analyst course', 'AML analyst training', 'KYC analyst training'],
    supportingPaths: ['/career-guides/kyc-aml-analyst/'], intent: 'KYC and AML are taught as one module within the broader Financial Operations Masterclass.',
  }),
  owner('reconciliation-analyst', 'reconciliation analyst', '/career-guides/reconciliation-analyst/', {
    queryVariants: ['reconciliation analyst course', 'reconciliation in banking', 'reconciliation jobs', 'reconciliation analyst salary', 'bank reconciliation jobs for freshers'],
    supportingPaths: ['/resources/reconciliation-in-finance/', '/resources/bank-reconciliation-process/'], intent: 'Role and workflow guidance; salary and employer requirements remain specific to current vacancies.',
  }),
  owner('settlement-analyst', 'trade settlement analyst career', '/career-guides/settlement-analyst/', {
    queryVariants: ['settlement analyst', 'trade settlement course', 'settlement analyst jobs', 'trade settlement operations', 'trade lifecycle course', 'settlement operations in investment banking'],
    supportingPaths: ['/career-guides/trade-lifecycle/', '/blog/settlement-trade-break-worked-example/'], intent: 'Settlement role guidance connected to lifecycle and fictional exception examples.',
  }),
  owner('corporate-actions-analyst-career', 'corporate actions analyst', '/blog/corporate-actions-analyst-career-path/', {
    intent: 'Corporate-actions role responsibilities and career context, distinct from the course-module and workflow owners.',
  }),
  owner('corporate-actions-workflow', 'corporate actions workflow', '/resources/corporate-actions-workflow/', {
    queryVariants: ['corporate actions jobs', 'corporate actions in investment banking', 'corporate actions operations'],
    supportingPaths: ['/courses/investment-banking-operations/', '/career-guides/investment-banking-operations/'], intent: 'Educational workflow and career context; course coverage is limited to the published module scope.',
  }),
  owner('finance-operations-module', 'finance operations module', '/courses/finance-operations/', {
    queryVariants: ['credit operations course', 'credit analyst course', 'loan operations course', 'loan processing course'],
    supportingPaths: ['/career-guides/credit-operations-analyst/', '/career-guides/credit-analyst/'], intent: 'Finance and credit operations concepts within the broader Masterclass, not separate credentials.',
  }),
  owner('digital-payments-course', 'digital payments course', '/courses/digital-payments/', {
    queryVariants: ['digital payments training', 'digital payments certification', 'digital payments operations course', 'payment operations course', 'SWIFT training', 'RTGS course', 'UPI operations'],
    supportingPaths: ['/career-guides/digital-payments-operations/'], intent: 'Digital payment operations concepts within the broader Masterclass, supported by role and workflow resources.',
  }),
  owner('payment-reconciliation-process', 'payment reconciliation', '/blog/payment-reconciliation-process-breaks-controls/', {
    intent: 'Payment-record matching and exception investigation, linked to the Digital Payments module and career guide.',
  }),
  owner('institute-comparison', 'best finance institute in India', '/compare/best-finance-institutes-india/', {
    queryVariants: ['best finance course in India with placement', 'best finance institute in India with a 100% job guarantee', 'top finance programs with published placement terms in India', 'top finance course with job guarantee', 'top rated finance course with placement in India', 'best finance training program in India with placement', 'best finance program with documented placement support', 'best finance institute for guaranteed finance jobs', 'best finance programme in India with placement'], supportingPaths: ['/best-finance-course-in-india-with-placement/'],
    intent: 'Provider comparison based on evidence, without unsupported rankings.',
  }),
  owner('investment-banking-course-comparison', 'best investment banking institute in India', '/best-investment-banking-course-india/', {
    queryVariants: ['best investment banking course in India', 'best investment banking course in India comparison', 'investment banking course from basics to advanced', 'complete investment banking course topics', 'investment banking course for freshers with placement'], intent: 'Investment banking course choice across distinct role paths.',
  }),
  owner('bcom-course-choice', 'finance course after BCom with placement', '/best-finance-course-after-bcom/', {
    queryVariants: ['finance course after BCom', 'best finance course after BCom', 'best finance course after BCom with job guarantee', 'BCom finance course with placement in India'], supportingPaths: ['/career-guides/finance-careers-after-graduation/'], intent: 'BCom course fit and placement-term research, linked to the broader graduate career guide.',
  }),
  owner('placement-and-guarantee', 'finance course with 100% job guarantee in India', '/placements/', {
    queryVariants: ['finance course with placement', 'finance course with placement in India', 'finance training with placement', 'finance course with job guarantee', 'finance course with job guarantee in India', 'finance course guarantee and placement terms', 'finance course with placement for graduates', 'job-oriented finance course with placement for freshers', 'which finance institute offers a 100% job guarantee in India', 'finance programme with job guarantee', 'finance course guaranteed job after completion', 'what does a finance course job guarantee include'],
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
    queryVariants: ['banking operations jobs', 'banking operations jobs for freshers', 'bank operations jobs for freshers'], intent: 'Beginner role guidance without an active-vacancy claim.',
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
  owner('credit-operations-jobs', 'credit operations analyst', '/career-guides/credit-operations-analyst/', {
    queryVariants: ['credit operations jobs', 'NBFC operations jobs'], intent: 'Credit-operations duties and preparation, distinct from a credit-analysis or course decision.',
  }),
  owner('digital-payments-jobs', 'digital payment operations', '/career-guides/digital-payments-operations/', {
    queryVariants: ['payment operations jobs'], intent: 'Payment-operations roles and workflow preparation, distinct from module course queries.',
  }),
  owner('gcc-finance-careers-india', 'GCC finance careers in India', '/blog/gcc-finance-careers-india/', {
    supportingPaths: ['/career-guides/finance-careers-after-graduation/'],
    intent: 'Career and role-family guidance for finance work in Global Capability Centres, distinct from the broad finance-operations career pillar.',
  }),
  owner('finance-vs-tech-career', 'finance vs tech career', '/blog/finance-vs-tech-career/', {
    supportingPaths: ['/career-guides/finance-careers-after-graduation/'],
    intent: 'Graduate career-choice comparison by work, skills, and role evidence rather than salary claims.',
  }),
  owner('banking-jobs-without-sales', 'banking jobs without sales', '/blog/banking-jobs-without-sales/', {
    supportingPaths: ['/career-guides/finance-careers-after-graduation/'],
    intent: 'Career discovery for banking operations and support roles, with sales duties verified at vacancy level.',
  }),
  owner('excel-python-ai-finance-skills', 'Excel vs Python in finance', '/blog/excel-python-ai-finance-skills/', {
    supportingPaths: ['/career-guides/finance-careers-after-graduation/'],
    intent: 'Task-based tool-learning advice for finance graduates; the existing investment-banking skills guide retains its broader workflow-skills intent.',
  }),
  owner('finance-entry-roadmap', 'how to enter finance after graduation', '/blog/how-to-enter-finance-after-graduation/', {
    supportingPaths: ['/career-guides/finance-careers-after-graduation/'],
    intent: 'A practical informational roadmap for role discovery and preparation, separate from course-selection and enrolment queries.',
  }),
  owner('ai-finance-job-impact', 'will AI replace finance jobs', '/blog/will-ai-replace-finance-jobs/', {
    supportingPaths: ['/career-guides/finance-careers-after-graduation/'],
    intent: 'Task-based, source-grounded discussion of AI and finance work without making unsupported job-loss forecasts.',
  }),
  owner('finance-career-without-professional-qualification', 'finance career without MBA', '/blog/finance-career-without-mba-cfa-ca/', {
    supportingPaths: ['/career-guides/finance-careers-after-graduation/'],
    intent: 'Role-specific explanation of qualification requirements, distinct from choosing or purchasing a training course.',
  }),
  owner('btech-to-finance-career', 'BTech to finance career', '/blog/btech-to-finance-career/', {
    supportingPaths: ['/career-guides/finance-careers-after-graduation/'],
    intent: 'Informational transition paths for engineering graduates; commercial course eligibility queries remain with the course page.',
  }),
  owner('ai-finance-career-paths', 'AI in finance careers', '/blog/ai-finance-careers/', {
    supportingPaths: ['/career-guides/finance-careers-after-graduation/'],
    intent: 'Role families that work with AI capabilities in finance, separate from broad AI impact and specific banking use-case pages.',
  }),
  owner('finance-jobs-for-freshers', 'finance jobs for freshers', '/blog/finance-jobs-for-freshers/', {
    supportingPaths: ['/career-guides/finance-careers-after-graduation/'],
    intent: 'An overview of finance role families and role research for new graduates, not an active vacancy listing.',
  }),
  owner('agentic-ai-banking', 'agentic AI in banking', '/blog/agentic-ai-banking/', {
    supportingPaths: ['/career-guides/finance-careers-after-graduation/'],
    intent: 'A cautious explainer of agentic AI concepts, banking workflow boundaries, and oversight rather than a deployment claim.',
  }),
  owner('ai-kyc-aml-careers', 'AI and KYC AML jobs', '/blog/ai-kyc-aml-jobs/', {
    supportingPaths: ['/career-guides/finance-careers-after-graduation/'],
    intent: 'How approved AI may affect KYC and AML work, distinct from general KYC career or course guidance.',
  }),
  owner('ai-credit-digital-lending-careers', 'AI credit analysis and digital lending', '/blog/ai-credit-and-digital-lending/', {
    supportingPaths: ['/career-guides/finance-careers-after-graduation/'],
    intent: 'Career and workflow context for AI-supported credit and digital lending, separate from credit-course intent.',
  }),
  owner('finance-career-map', 'finance career paths in banking and fintech', '/blog/future-finance-career-map/', {
    supportingPaths: ['/career-guides/finance-careers-after-graduation/'],
    intent: 'A cross-role informational map connecting finance role families without claiming a standard ladder or course ranking.',
  }),
]);
