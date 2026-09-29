import { CAREER_TRACKS, PROGRAM } from './sourceContent.js';

const REVIEW_DATE = '2026-09-26';

export const COMPARISON_PAGE = Object.freeze({
  id: 'comparison-investment-banking-operations',
  routeId: 'comparison-investment-banking-operations',
  path: '/compare/investment-banking-operations-courses/',
  title: 'Investment Banking Operations Course Comparison',
  description: 'Compare investment banking operations courses in India by curriculum, delivery, credentials, support terms and fit using dated provider information.',
  h1: 'Compare Investment Banking Operations Courses in India',
  breadcrumbLabel: 'Course comparison',
  primaryKeyword: 'Imarticus investment banking course alternative',
  updatedAt: REVIEW_DATE,
  reviewStatus: 'approved-for-indexing',
  directAnswer: 'There is no single investment banking operations course that is right for every learner. Compare the current syllabus, delivery format, schedule, credential, total fee and refund terms, career-support wording, eligibility, and location directly on each provider’s official page. This neutral guide records public descriptions without ranking providers, repeating unverified outcomes, or claiming affiliation with any provider.',
  criteria: Object.freeze([
    Object.freeze({ name: 'Curriculum fit', question: 'Does the syllabus teach the workflow you want?', detail: 'Look for the actual processes behind the target role: trade lifecycle, settlements, reconciliations, KYC and AML, lending, fund or asset servicing, reporting, or financial modelling. A broad title can hide a very different day-to-day focus.' }),
    Object.freeze({ name: 'Delivery and schedule', question: 'Can you attend the stated format?', detail: 'Check live versus recorded learning, classroom versus online delivery, weekday or weekend timing, attendance rules, cohort dates, and whether the listed city applies to your batch.' }),
    Object.freeze({ name: 'Credential and provider', question: 'What exactly is awarded and by whom?', detail: 'Separate an institute certificate, an academic certificate, a professional-exam preparation route, and a partner-branded credential. Read the current terms for eligibility, assessments, completion, and any partner relationship.' }),
    Object.freeze({ name: 'Career support wording', question: 'What support is actually included?', detail: 'Ask the provider to explain the scope of resume review, interview preparation, opportunity access, participation rules, support duration, and employer decision-making. Treat support as a service to verify, not as an employment result.' }),
    Object.freeze({ name: 'Total learner commitment', question: 'What is the full cost and time commitment?', detail: 'Request the current fee sheet, taxes, financing or instalment terms, refund policy, equipment requirements, study hours, and any additional assessment or certification costs before paying.' }),
  ]),
  providers: Object.freeze([
    Object.freeze({
      name: 'Imarticus Learning — CIBOP',
      officialUrl: 'https://imarticus.org/certified-investment-banking-operations-program-cibop/',
      publishedFocus: 'The official CIBOP page describes a practical programme focused on investment banking operations, compliance, asset management, and transaction-lifecycle topics. It also presents weekday and weekend formats.',
      verify: 'Confirm the applicable batch, current curriculum, delivery location, fee sheet, credential terms, and career-support conditions.',
    }),
    Object.freeze({
      name: 'IMS Proschool — Securities Market & Investment Banking Operations',
      officialUrl: 'https://proschoolonline.com/investment-banking-course',
      publishedFocus: 'The current official SMIBO page describes securities-market foundations, financial analysis, equity derivatives, investment banking operations, and clearing, settlement and risk-management modules.',
      verify: 'Check the current programme page and applicable brochure for the exact duration, internship conditions, delivery mode, syllabus, assessment, credential wording, fee, and support terms for your batch.',
    }),
    Object.freeze({
      name: 'upGrad — Global & Investment Banking Operations',
      officialUrl: 'https://www.upgrad.com/offline-centres/certificate-global-investment-banking-operations-course-in-pune-city/',
      publishedFocus: 'The official centre page describes a certificate route with trade operations, KYC/AML, lending operations, and workplace-automation topics. The page is city-specific, so its batch and location should not be generalized.',
      verify: 'Confirm whether the page applies to your city, the current centre, batch schedule, full curriculum, certificate issuer, fee and scholarship terms, and career-support conditions.',
    }),
    Object.freeze({
      name: 'TimesPro — Investment Banking Operations Program',
      officialUrl: 'https://timespro.com/early-career/investment-banking-operations-program',
      publishedFocus: 'The official TimesPro page describes an Investment Banking Operations Program covering trade life-cycle management, compliance, settlements, and asset management.',
      verify: 'Verify the current programme partner, admission requirements, delivery format, batch dates, curriculum depth, assessment, credential, fee, and support terms.',
    }),
    Object.freeze({
      name: 'MentorMeCareers — Investment Banking Operations',
      officialUrl: 'https://mentormecareers.com/%E2%80%A0investment-banking-operations-analyst-program/',
      publishedFocus: 'The official Investment Banking Operations Analyst programme page describes trade lifecycle, settlements, reconciliations, capital-markets workflows, and interview preparation.',
      verify: 'Ask which current route applies to you, whether it is live online or classroom, the exact curriculum and duration, the applicable location, and the conditions for career support.',
    }),
    Object.freeze({
      name: 'SmartSteps — Global Accounting & Finance Program',
      officialUrl: 'https://www.smartsteps.in/',
      publishedFocus: 'The official SmartSteps site describes a Global Accounting & Finance Program with finance operations, investment banking operations, Excel, communication, and career preparation topics.',
      verify: 'Confirm the current Hyderabad classroom or online option, syllabus, schedule, credential, fee and tax terms, eligibility, and what support is included for your cohort.',
    }),
  ]),
  centaur: Object.freeze({
    name: `${PROGRAM.name} — Centaur Careers`,
    focus: `The published ${PROGRAM.name} information presents ${CAREER_TRACKS.map((track) => track.title).join(', ')} as curriculum topics and career directions within one masterclass.`,
    access: 'The published access model describes live online sessions for learners across India and in-person sessions at Mindsprout Career Hub, Lucknow. Confirm the current cohort schedule, fees, eligibility, and support terms directly.',
    verify: 'Compare the current provider information with the official pages above on scope, mode, schedule, credential, total commitment, and support terms before choosing a programme.',
  }),
  checklist: Object.freeze([
    'Save the official syllabus and fee page for the exact batch, with its publication or access date.',
    'Write down the workflow and role vocabulary you want to learn, then map each provider’s modules to it.',
    'Ask admissions to explain delivery, attendance, assessments, credential, refund terms, and career-support conditions.',
    'Check whether a location-specific page describes a real classroom, an online route, or a marketing landing page for a different city.',
    'Keep provider claims separate from your own decision: fit, schedule, budget, learning preference, and documented terms should drive the comparison.',
  ]),
  faqs: Object.freeze([
    Object.freeze({ question: 'Which investment banking operations course is best?', answer: 'There is no universal best choice. Select the course whose current syllabus, delivery, schedule, credential, total commitment, and support terms fit your target workflow and circumstances. Use official provider pages and ask admissions to explain current terms before enrolling.' }),
    Object.freeze({ question: 'Is Centaur Careers an alternative to Imarticus CIBOP or other providers?', answer: 'Centaur Careers offers its own Financial Operations Masterclass. This page provides a neutral comparison framework and public-source snapshots; it does not state that one provider is superior or imply affiliation with another provider.' }),
    Object.freeze({ question: 'Should I compare fees before curriculum?', answer: 'Compare both, but understand the workflow and learning format first. A lower or higher fee cannot tell you whether the syllabus, schedule, credential, support terms, and total learner commitment match your goal.' }),
    Object.freeze({ question: 'How can I compare online and classroom investment banking courses?', answer: 'Check live interaction, recordings, attendance, practical work, schedule, location, technology requirements, assessment, learner support, and any travel or equipment cost. Confirm that the advertised mode applies to the exact cohort you would join.' }),
    Object.freeze({ question: 'Does this page recommend one provider?', answer: 'No. It records what selected official provider pages describe as of the review date and lists the facts a learner should verify. Provider pages, brochures, batch terms, and pricing can change, so open the source and confirm the exact terms before enrolling.' }),
  ]),
  sources: Object.freeze([
    Object.freeze({ label: 'Imarticus Learning — CIBOP official programme page', href: 'https://imarticus.org/certified-investment-banking-operations-program-cibop/' }),
    Object.freeze({ label: 'IMS Proschool — current SMIBO programme page', href: 'https://proschoolonline.com/investment-banking-course' }),
    Object.freeze({ label: 'IMS Proschool — 2025 IBO brochure (historical reference)', href: 'https://proschoolonline.com/wp-content/uploads/2025/07/IBO-Brochure.pdf' }),
    Object.freeze({ label: 'upGrad — Global & Investment Banking Operations centre page', href: 'https://www.upgrad.com/offline-centres/certificate-global-investment-banking-operations-course-in-pune-city/' }),
    Object.freeze({ label: 'TimesPro — Investment Banking Operations Program', href: 'https://timespro.com/early-career/investment-banking-operations-program' }),
    Object.freeze({ label: 'MentorMeCareers — Investment Banking Operations Analyst programme page', href: 'https://mentormecareers.com/%E2%80%A0investment-banking-operations-analyst-program/' }),
    Object.freeze({ label: 'SmartSteps — official training academy page', href: 'https://www.smartsteps.in/' }),
  ]),
});
