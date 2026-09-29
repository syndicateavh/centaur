// Phase 10 authority model. This file describes the intended relationship
// between the existing pages; it does not add keyword-stuffed copy or claim
// that an external link has been earned.

export const AUTHORITY_TARGETS = Object.freeze([
  Object.freeze({
    routeId: 'courses',
    tier: 'priority-commercial',
    purpose: 'Primary Financial Operations Masterclass destination.',
    requiredInboundRouteIds: Object.freeze(['home', 'blog', 'career-guides', 'resources', 'india', 'placements', 'faqs', 'lucknow-location']),
    minimumInbound: 8,
  }),
  Object.freeze({
    routeId: 'india',
    tier: 'national-hub',
    purpose: 'National online availability and regional discovery hub.',
    requiredInboundRouteIds: Object.freeze(['home', 'blog', 'career-guides', 'resources', 'courses', 'placements', 'faqs', 'lucknow-location']),
    minimumInbound: 8,
  }),
  Object.freeze({
    routeId: 'career-guides',
    tier: 'information-hub',
    purpose: 'Career-intent hub that introduces the authored guide cluster.',
    requiredInboundRouteIds: Object.freeze(['home', 'blog', 'resources', 'courses', 'india', 'placements', 'faqs']),
    minimumInbound: 7,
  }),
  Object.freeze({
    routeId: 'resources',
    tier: 'information-hub',
    purpose: 'Practical finance-career resource hub.',
    requiredInboundRouteIds: Object.freeze(['home', 'blog', 'career-guides', 'courses', 'india']),
    minimumInbound: 5,
  }),
  Object.freeze({
    routeId: 'placements',
    tier: 'commercial-support',
    purpose: 'Placement-support terms and eligibility destination.',
    requiredInboundRouteIds: Object.freeze(['home', 'blog', 'career-guides', 'resources', 'courses', 'india', 'faqs']),
    minimumInbound: 7,
  }),
  Object.freeze({
    routeId: 'lucknow-location',
    tier: 'local-commercial',
    purpose: 'Lucknow offline availability and local entity destination.',
    requiredInboundRouteIds: Object.freeze(['home', 'career-guides', 'resources', 'courses', 'india', 'faqs', 'contact']),
    minimumInbound: 7,
  }),
  Object.freeze({
    routeId: 'investment-banking-operations',
    tier: 'commercial-module',
    purpose: 'Investment banking operations module destination.',
    requiredInboundRouteIds: Object.freeze(['courses', 'india', 'career-guide-investment-banking-operations', 'resource-investment-banking-interview-questions']),
    minimumInbound: 4,
  }),
  Object.freeze({
    routeId: 'retail-banking',
    tier: 'commercial-module',
    purpose: 'Retail banking module destination.',
    requiredInboundRouteIds: Object.freeze(['courses', 'career-guide-retail-banking-operations', 'india']),
    minimumInbound: 3,
  }),
  Object.freeze({
    routeId: 'finance-operations',
    tier: 'commercial-module',
    purpose: 'Finance operations module destination.',
    requiredInboundRouteIds: Object.freeze(['courses', 'career-guide-finance-operations', 'india']),
    minimumInbound: 3,
  }),
  Object.freeze({
    routeId: 'kyc-aml-compliance',
    tier: 'informational-module',
    purpose: 'KYC / AML module guide connected to the current Masterclass and relevant career guidance.',
    requiredInboundRouteIds: Object.freeze(['courses', 'india', 'career-guide-kyc-aml-analyst']),
    minimumInbound: 3,
  }),
  Object.freeze({
    routeId: 'digital-payments',
    tier: 'informational-module',
    purpose: 'Digital Payments module guide connected to the current Masterclass and relevant career guidance.',
    requiredInboundRouteIds: Object.freeze(['courses', 'india', 'career-guide-digital-payments-operations']),
    minimumInbound: 3,
  }),
  Object.freeze({
    routeId: 'fintech-neo-banking',
    tier: 'informational-module',
    purpose: 'FinTech module guide connected to the current Masterclass and related FinTech career guidance.',
    requiredInboundRouteIds: Object.freeze(['courses', 'india', 'career-guide-fintech-operations']),
    minimumInbound: 3,
  }),
]);

// These are deliberate journeys used to check that the graph connects
// discovery, learning, commercial intent, local/national context, and contact.
export const AUTHORITY_PATHS = Object.freeze([
  Object.freeze({
    id: 'commercial-enrollment-journey',
    routeIds: Object.freeze(['home', 'courses', 'investment-banking-operations', 'placements', 'contact']),
  }),
  Object.freeze({
    id: 'career-to-course-journey',
    routeIds: Object.freeze(['home', 'career-guides', 'career-guide-finance-operations', 'finance-operations', 'courses']),
  }),
  Object.freeze({
    id: 'resource-to-module-journey',
    routeIds: Object.freeze(['home', 'resources', 'resource-investment-banking-interview-questions', 'investment-banking-operations', 'placements']),
  }),
  Object.freeze({
    id: 'national-regional-journey',
    routeIds: Object.freeze(['home', 'india', 'india-delhi-ncr', 'career-guides', 'courses']),
  }),
  Object.freeze({
    id: 'lucknow-local-journey',
    routeIds: Object.freeze(['home', 'india', 'lucknow-location', 'contact']),
  }),
  Object.freeze({
    id: 'kyc-aml-learning-journey',
    routeIds: Object.freeze(['home', 'india', 'kyc-aml-compliance', 'career-guide-kyc-aml-analyst', 'courses']),
  }),
  Object.freeze({
    id: 'digital-payments-learning-journey',
    routeIds: Object.freeze(['home', 'courses', 'digital-payments', 'career-guide-digital-payments-operations', 'india']),
  }),
  Object.freeze({
    id: 'fintech-learning-journey',
    routeIds: Object.freeze(['home', 'career-guides', 'career-guide-fintech-operations', 'fintech-neo-banking', 'courses']),
  }),
  Object.freeze({
    id: 'delhi-ncr-regional-journey',
    routeIds: Object.freeze(['home', 'india', 'india-delhi-ncr', 'career-guide-kyc-aml-analyst', 'courses']),
  }),
  Object.freeze({
    id: 'bengaluru-regional-journey',
    routeIds: Object.freeze(['home', 'india', 'india-bengaluru', 'career-guide-digital-payments-operations', 'courses']),
  }),
  Object.freeze({
    id: 'mumbai-regional-journey',
    routeIds: Object.freeze(['home', 'india', 'india-mumbai', 'career-guide-trade-lifecycle', 'courses']),
  }),
  Object.freeze({
    id: 'pune-regional-journey',
    routeIds: Object.freeze(['home', 'india', 'india-pune', 'career-guide-finance-operations', 'courses']),
  }),
  Object.freeze({
    id: 'hyderabad-regional-journey',
    routeIds: Object.freeze(['home', 'india', 'india-hyderabad', 'career-guide-kyc-aml-analyst', 'courses']),
  }),
]);

// An asset inventory gives outreach a useful, factual destination. It is a
// plan for earning editorial references, not a record of links already won.
export const LINKABLE_AUTHORITY_ASSETS = Object.freeze([
  Object.freeze({
    id: 'placement-terms-guide',
    status: 'gated',
    targetPath: '/blog/placement-support-eligibility-and-terms/',
    format: 'terms explainer',
    audience: 'Finance-career learners evaluating placement support.',
    editorialValue: 'Explains participation, support boundaries, and the canonical guarantee conditions in one reference.',
    readerOutcome: 'A reader can separate eligibility, process, and provider terms before relying on a placement-support statement.',
  }),
  Object.freeze({
    id: 'finance-career-insights-hub',
    status: 'active',
    targetPath: '/blog/',
    format: 'editorial archive',
    audience: 'Readers researching finance operations and BFSI career directions.',
    editorialValue: 'First-party archive of practical finance-career and banking job guidance.',
    readerOutcome: 'A reader can move from a broad finance-career question to focused, authored explainers without a keyword-stuffed directory.',
  }),
  Object.freeze({
    id: 'banking-interview-resource',
    status: 'active',
    targetPath: '/resources/investment-banking-interview-questions/',
    format: 'interview toolkit',
    audience: 'Freshers preparing for investment banking operations interviews.',
    editorialValue: 'Structured interview preparation resource with practical process context.',
    readerOutcome: 'A learner can practise trade lifecycle, settlement, reconciliation, corporate-actions, and behavioural explanations using a repeatable answer structure.',
  }),
  Object.freeze({
    id: 'course-hub',
    status: 'active',
    targetPath: '/courses/',
    format: 'program reference',
    audience: 'Learners comparing finance operations training pathways.',
    editorialValue: 'Current masterclass scope and module relationships in one canonical page.',
    readerOutcome: 'A learner can inspect the provider-specific program scope and distinguish modules from independent career guidance.',
  }),
  Object.freeze({
    id: 'lucknow-location',
    status: 'active',
    targetPath: '/locations/lucknow/',
    format: 'local access reference',
    audience: 'Lucknow learners looking for local finance-career training context.',
    editorialValue: 'Local location information with clear offline and online availability boundaries.',
    readerOutcome: 'A local learner can verify the published Lucknow setting without confusing national online access with a city-branch network.',
  }),
  Object.freeze({
    id: 'placement-support',
    status: 'active',
    targetPath: '/placements/',
    format: 'eligibility and process reference',
    audience: 'Learners assessing career support before choosing a program.',
    editorialValue: 'Approved placement-support promise, eligibility, and process boundaries.',
    readerOutcome: 'A learner can review the published program conditions and the questions that still require direct confirmation.',
  }),
  Object.freeze({
    id: 'provider-context-guide',
    status: 'gated',
    targetPath: '/blog/what-centaur-careers-provides-for-finance-careers/',
    format: 'provider context guide',
    audience: 'Readers researching what a finance-career training provider publishes.',
    editorialValue: 'Explains provider-specific learning context while keeping general career guidance separate from current program terms.',
    readerOutcome: 'A reader can identify which statements describe Centaur Careers and which decisions require current provider confirmation.',
  }),
  Object.freeze({
    id: 'program-faq-reference',
    status: 'active',
    targetPath: '/faqs/',
    format: 'program FAQ reference',
    audience: 'Learners with practical questions about finance-course participation.',
    editorialValue: 'Central FAQ destination for current program questions and next-step clarification.',
    readerOutcome: 'A prospective learner can find the right question to ask before requesting current fees, schedule, mode, or support terms.',
  }),
  Object.freeze({
    id: 'finance-foundations-reference',
    status: 'active',
    targetPath: '/resources/finance-gk/',
    format: 'foundations learning hub',
    audience: 'Beginners building Indian finance and BFSI context.',
    editorialValue: 'Explains foundational finance concepts and short knowledge checks before interview or career research.',
    readerOutcome: 'A beginner can learn the vocabulary needed to read banking, payments, securities, and finance-operations role descriptions.',
  }),
  Object.freeze({
    id: 'accounting-basics-reference',
    status: 'active',
    targetPath: '/resources/accounting-basics/',
    format: 'accounting reference guide',
    audience: 'Finance and BFSI learners revising accounting fundamentals.',
    editorialValue: 'Provides original explanations of accounting rules, debit and credit, examples, and beginner mistakes.',
    readerOutcome: 'A learner can explain a basic accounting rule, test it against a simple transaction, and identify where real policy must be checked.',
  }),
  Object.freeze({
    id: 'reconciliation-workflow-reference',
    status: 'active',
    targetPath: '/resources/reconciliation-in-finance/',
    format: 'workflow reference guide',
    audience: 'Learners and educators explaining reconciliation in finance operations.',
    editorialValue: 'Shows how to define, investigate, document, and escalate reconciliation breaks without forcing records to match.',
    readerOutcome: 'A learner can describe a careful reconciliation workflow and distinguish a timing difference from an unresolved error.',
  }),
  Object.freeze({
    id: 'regional-market-guides',
    status: 'active',
    targetPath: '/india/',
    format: 'national and regional research hub',
    audience: 'India-wide learners comparing online access with regional finance-career context.',
    editorialValue: 'Connects national access information to a small set of evidence-backed regional market guides.',
    readerOutcome: 'A learner can research a regional finance market without assuming a physical branch, local placement, or unsupported employer result.',
  }),
  Object.freeze({
    id: 'commerce-career-decision-map',
    status: 'active',
    targetPath: '/blog/career-options-in-commerce-decision-map/',
    format: 'career decision map',
    audience: 'Commerce graduates comparing finance and business career directions.',
    editorialValue: 'Compares role families by day-to-day tasks, strengths, and sensible next research steps instead of presenting an unsupported salary ranking.',
    readerOutcome: 'A reader can shortlist career paths to investigate and identify the entry requirements they still need to verify.',
  }),
  Object.freeze({
    id: 'fresher-interview-answer-rubric',
    status: 'active',
    targetPath: '/blog/finance-interview-questions-freshers/',
    format: 'interview answer framework and rubric',
    audience: 'Fresh graduates preparing for finance and operations interviews.',
    editorialValue: 'Pairs sample questions with a reusable answer structure and a self-review rubric, without claiming to predict an employer interview.',
    readerOutcome: 'A reader can practise concise, evidence-based answers and identify gaps before an interview.',
  }),
  Object.freeze({
    id: 'financial-accounting-cycle-guide',
    status: 'active',
    targetPath: '/blog/financial-accounting-statements-process-examples/',
    format: 'accounting cycle explainer',
    audience: 'Beginners learning financial accounting and statement preparation.',
    editorialValue: 'Connects a fictional transaction to journals, ledgers, a trial balance, adjustments, and financial statements.',
    readerOutcome: 'A reader can explain how source transactions flow into statements and where checks occur.',
  }),
  Object.freeze({
    id: 'cost-accounting-worked-example',
    status: 'active',
    targetPath: '/blog/cost-accounting-methods-examples/',
    format: 'fictional cost comparison',
    audience: 'Students and early-career readers exploring cost accounting concepts.',
    editorialValue: 'Uses a transparent fictional example to distinguish direct, indirect, fixed, variable, and allocated costs.',
    readerOutcome: 'A reader can follow a basic cost classification and understand why allocation assumptions must be disclosed.',
  }),
  Object.freeze({
    id: 'investment-banking-team-workflow',
    status: 'active',
    targetPath: '/blog/investment-banking-teams-operations/',
    format: 'team and workflow explainer',
    audience: 'Readers researching investment banking teams and operations roles.',
    editorialValue: 'Separates advisory and markets activities from post-trade processing, control, and support functions.',
    readerOutcome: 'A reader can place an operations role in a broad transaction lifecycle without confusing it with front-office advice.',
  }),
  Object.freeze({
    id: 'commercial-bank-service-workflow',
    status: 'active',
    targetPath: '/blog/commercial-banks-services-operations/',
    format: 'banking service workflow',
    audience: 'Beginners learning commercial-bank services and operational handoffs.',
    editorialValue: 'Maps a fictional banking service from customer request through checks, processing, posting, and reconciliation.',
    readerOutcome: 'A reader can identify common operational controls while distinguishing a commercial bank from other financial institutions.',
  }),
  Object.freeze({
    id: 'trial-balance-check-example',
    status: 'active',
    targetPath: '/blog/trial-balance-format-errors-reconciliation/',
    format: 'ungated accounting example and checklist',
    audience: 'Learners revising trial balances and basic accounting checks.',
    editorialValue: 'Provides a fictional debit-credit example, error checklist, and clear explanation of what equal totals do not prove.',
    readerOutcome: 'A reader can use a trial balance as a check without treating it as proof that every transaction is correct.',
  }),
  Object.freeze({
    id: 'balance-sheet-worked-example',
    status: 'active',
    targetPath: '/blog/balance-sheet-meaning-format-example/',
    format: 'annotated fictional balance sheet',
    audience: 'Beginners learning assets, liabilities, equity, and balance-sheet structure.',
    editorialValue: 'Shows a balanced fictional statement with transparent totals and a reader-friendly review checklist.',
    readerOutcome: 'A reader can explain the accounting equation and inspect a simple illustrative balance sheet.',
  }),
  Object.freeze({
    id: 'financial-markets-participant-map',
    status: 'active',
    targetPath: '/blog/financial-markets-instruments-participants-operations/',
    format: 'participant-to-lifecycle map',
    audience: 'Learners exploring financial markets and securities operations.',
    editorialValue: 'Connects market participants and instrument categories to a high-level transaction lifecycle using authoritative public sources.',
    readerOutcome: 'A reader can distinguish market roles and follow the broad path from order to settlement.',
  }),
  Object.freeze({
    id: 'financial-management-decision-framework',
    status: 'active',
    targetPath: '/blog/financial-management-decisions-controls/',
    format: 'decision framework and illustrative case',
    audience: 'Readers learning foundational financial-management decisions and controls.',
    editorialValue: 'Organizes investment, financing, liquidity, and control questions around a clearly fictional business case.',
    readerOutcome: 'A reader can describe core decision areas and identify when assumptions or professional advice are required.',
  }),
]);

export const AUTHORITY_OUTREACH_GUARDRAILS = Object.freeze([
  'Qualify the publisher manually for topical relevance, audience fit, editorial quality, and independence.',
  'Offer a useful factual reference or contribution; never require a link as the condition of value.',
  'Do not buy links, automate directory submissions, create link exchanges at scale, or use private link networks.',
  'Record an external HTTPS source only after the link is publicly visible and manually checked.',
  'Keep anchor text natural and let the publisher choose wording where appropriate.',
  'Do not claim traffic, rankings, authority, or partnership outcomes before evidence exists.',
]);

export function getAuthorityTarget(routeId) {
  return AUTHORITY_TARGETS.find((target) => target.routeId === routeId) || null;
}

export function getLinkableAuthorityAsset(assetId) {
  return LINKABLE_AUTHORITY_ASSETS.find((asset) => asset.id === assetId) || null;
}
