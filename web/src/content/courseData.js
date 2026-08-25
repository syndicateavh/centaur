export const COURSE_DATA = Object.freeze({
  'investment-banking-operations': {
    seoId: 'investment-banking-operations',
    eyebrow: 'Investment operations pathway',
    intro:
      'Build a working understanding of the post-trade processes used to record, settle, reconcile and report financial-market transactions.',
    overview:
      'This course is designed for learners who want a practical introduction to investment banking operations. Lessons connect process concepts with examples, exercises and interview preparation without promising a particular employer or employment outcome.',
    modules: [
      {
        title: 'Markets and trade lifecycle',
        description: 'Understand market participants and the steps between trade capture, confirmation, settlement and reporting.',
      },
      {
        title: 'Settlements and reconciliations',
        description: 'Work through settlement instructions, common breaks, exception tracking and reconciliation controls.',
      },
      {
        title: 'Corporate actions',
        description: 'Study dividends, interest payments, stock events and the operational flow around mandatory and voluntary events.',
      },
      {
        title: 'Fund accounting foundations',
        description: 'Learn the purpose of NAV calculations, cash and position checks, expense treatment and control review.',
      },
      {
        title: 'Operational risk and reporting',
        description: 'Recognise process risks, escalation practices, maker-checker controls and useful operational reporting.',
      },
      {
        title: 'Interview readiness',
        description: 'Practise explaining operational concepts, approaching scenarios and presenting relevant project work.',
      },
    ],
    outcomes: [
      'Explain the investment trade lifecycle in clear operational terms',
      'Identify common settlement and reconciliation exceptions',
      'Understand the purpose of corporate-action and fund-accounting controls',
      'Present process knowledge through structured interview answers',
    ],
    audience: [
      'Graduates and final-year students exploring financial-services operations',
      'Early-career professionals moving toward investment operations',
      'Learners who want guided practice alongside foundational concepts',
    ],
    relatedRoles: [
      'Investment operations trainee',
      'Reconciliation analyst trainee',
      'Fund accounting trainee',
      'Corporate actions trainee',
    ],
  },
  'retail-banking': {
    seoId: 'retail-banking',
    eyebrow: 'Customer and branch banking pathway',
    intro:
      'Learn how everyday banking products, branch processes, customer service and relationship responsibilities fit together.',
    overview:
      'The retail banking course introduces the processes learners are likely to encounter in customer-facing and branch-support environments. Training focuses on product understanding, responsible communication, documentation and process discipline.',
    modules: [
      {
        title: 'Banking products and customers',
        description: 'Review deposit products, payments, service channels and the needs of different customer segments.',
      },
      {
        title: 'Branch operations',
        description: 'Understand account-service workflows, documentation, transaction controls and daily operational routines.',
      },
      {
        title: 'Relationship management',
        description: 'Practise needs discovery, responsible product explanation, follow-up and long-term customer service.',
      },
      {
        title: 'Loan-processing foundations',
        description: 'Learn the purpose of application checks, document collection, verification and hand-offs in lending workflows.',
      },
      {
        title: 'KYC and conduct basics',
        description: 'Study customer identification, record quality, escalation and the importance of fair, compliant conduct.',
      },
      {
        title: 'Communication and interviews',
        description: 'Practise customer scenarios, professional communication and role-specific interview questions.',
      },
    ],
    outcomes: [
      'Describe common retail banking products and service journeys',
      'Follow the logic of branch and account-service workflows',
      'Communicate product information clearly and responsibly',
      'Approach customer and process scenarios in structured interviews',
    ],
    audience: [
      'Graduates and final-year students interested in customer-facing banking',
      'Learners preparing for branch and relationship-support responsibilities',
      'Early-career professionals seeking structured retail banking foundations',
    ],
    relatedRoles: [
      'Branch operations trainee',
      'Customer service executive',
      'Relationship support trainee',
      'Loan-processing trainee',
    ],
  },
  'finance-operations': {
    seoId: 'finance-operations',
    eyebrow: 'Lending and process pathway',
    intro:
      'Develop practical foundations in lending operations, documentation, payment processes, controls and NBFC workflows.',
    overview:
      'This course connects finance concepts with the operational work required to process applications, maintain accurate records, reconcile activity and support control reviews. It is designed as career preparation, not as a promise of placement.',
    modules: [
      {
        title: 'Finance operations foundations',
        description: 'Understand operational teams, process ownership, service levels, documentation and control responsibilities.',
      },
      {
        title: 'Loan and credit workflows',
        description: 'Follow applications through document checks, verification, assessment support, approval and disbursal stages.',
      },
      {
        title: 'NBFC operations',
        description: 'Explore the operating model of non-bank lenders and common servicing, collections and reporting touchpoints.',
      },
      {
        title: 'Payments and reconciliations',
        description: 'Study payment flows, transaction matching, unresolved items and the importance of timely exception handling.',
      },
      {
        title: 'Risk and process controls',
        description: 'Learn maker-checker controls, audit trails, escalation, data accuracy and basic operational risk concepts.',
      },
      {
        title: 'Workplace and interview practice',
        description: 'Use process scenarios, spreadsheets and communication exercises to prepare for entry-level discussions.',
      },
    ],
    outcomes: [
      'Map a basic loan application and servicing workflow',
      'Recognise the role of documentation and process controls',
      'Explain payment reconciliation and exception handling',
      'Use finance-operations language confidently in interviews',
    ],
    audience: [
      'Graduates and final-year students exploring finance operations',
      'Learners interested in lending, payments or NBFC processes',
      'Early-career professionals building process and control knowledge',
    ],
    relatedRoles: [
      'Loan operations trainee',
      'Finance operations trainee',
      'Payment operations trainee',
      'Credit-processing trainee',
    ],
  },
});

export function getCourseData(id) {
  const course = COURSE_DATA[id];
  if (!course) {
    throw new Error(`Unknown course id: ${id}`);
  }
  return course;
}
