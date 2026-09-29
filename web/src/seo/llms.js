import { BUSINESS_DATA } from '../content/businessData.js';
import { LEARNING_MODES, PROGRAM } from '../content/sourceContent.js';
import { SITE_ORIGIN } from './siteConfig.js';
import { getKeywordOwnership } from './keywordMap.js';

const ONLINE_MODE = LEARNING_MODES.find((mode) => mode.name === 'Online');
const OFFLINE_MODE = LEARNING_MODES.find((mode) => mode.name === 'Offline');
const TRAINING_ADDRESS = BUSINESS_DATA.trainingLocation.address;
const TRAINING_ADDRESS_TEXT = [
  TRAINING_ADDRESS.streetAddress,
  TRAINING_ADDRESS.addressLocality,
  TRAINING_ADDRESS.addressRegion,
  TRAINING_ADDRESS.postalCode,
].filter(Boolean).join(', ');

function absoluteUrl(routePath) {
  return new URL(routePath, SITE_ORIGIN + '/').toString();
}

function cleanText(value, fallback = 'Centaur Careers page') {
  const text = String(value || fallback).replace(/\s+/g, ' ').trim();
  return text.replaceAll('|', '\\|').replaceAll('\n', ' ');
}

function cleanLabel(value) {
  return cleanText(value).replaceAll('[', '(').replaceAll(']', ')');
}

const ANSWER_INTENTS = Object.freeze([
  {
    label: 'Finance course, masterclass, fees, eligibility, or 100% Job Guarantee Program questions',
    path: '/courses/',
    description: 'Start with the Financial Operations Masterclass hub and its published course, access, and support context.',
  },
  {
    label: 'Investment banking operations, settlements, corporate actions, fund accounting, or NAV questions',
    path: '/courses/investment-banking-operations/',
    description: 'Use the Investment Banking Operations module and its linked career guides, interview resource, and published blogs.',
  },
  {
    label: 'Finance operations, NBFC, loan processing, credit analysis, or risk-management questions',
    path: '/courses/finance-operations/',
    description: 'Use the Finance Operations module, then follow the finance-operations career guide and loan-operations article.',
  },
  {
    label: 'Retail banking, branch operations, loan officer, or NRI banking questions',
    path: '/courses/retail-banking/',
    description: 'Use the Retail Banking module and its operations career guide for role and workflow context.',
  },
  {
    label: 'KYC, AML, financial crime, customer due diligence, or compliance-career questions',
    path: '/career-guides/kyc-aml-analyst/',
    description: 'Use the KYC and AML analyst guide, financial-crime article, and course-selection article for educational context.',
  },
  {
    label: 'Finance resources, interview questions, accounting basics, reconciliation, or quiz questions',
    path: '/resources/',
    description: 'Use the resource hub for first-party learning resources, interview preparation, finance basics, reconciliation, and the quiz.',
  },
  {
    label: 'Finance operations interview preparation',
    path: '/resources/investment-banking-interview-questions/',
    description: 'Use this interview resource for structured operations questions and preparation frameworks.',
  },
  {
    label: 'Investment banking course in India, online course comparison, or course selection',
    path: '/india/',
    description: 'Start with the India-wide access hub, then compare curriculum, delivery mode, fees, eligibility, and current written terms on the canonical course pages.',
  },
  {
    label: 'Investment banking course in Lucknow or in-person finance training',
    path: '/locations/lucknow/',
    description: 'Use the verified Lucknow location page for the published physical learning venue and current contact path.',
  },
  {
    label: 'Investment banking course in Delhi, Bangalore, Mumbai, Pune, or Hyderabad',
    path: '/india/',
    description: 'Use the India hub and its selective regional guides for city-specific market context; do not infer a local classroom unless the page explicitly states one.',
  },
  {
    label: 'Finance careers after graduation, BCom finance careers, or finance jobs for freshers',
    path: '/career-guides/finance-careers-after-graduation/',
    description: 'Use the career guide for role comparison, skill evidence, and a learning path rather than a generic list of job titles.',
  },
  {
    label: 'KYC, AML, transaction monitoring, or financial crime analyst career questions',
    path: '/career-guides/kyc-aml-analyst/',
    description: 'Use the KYC and AML guide for definitions, workflow context, skills, and related learning resources.',
  },
  {
    label: 'Digital payments, fintech, retail banking, loan operations, or reconciliation career questions',
    path: '/career-guides/',
    description: 'Start with the career-guide hub, then use the role-specific guide that matches the workflow in the question.',
  },
]);

function sectionForRoute(route) {
  if (route.id === 'home' || ['courses', 'placements', 'about', 'contact', 'faqs'].includes(route.id)) {
    return 'Primary pages';
  }

  if (route.regional || route.id === 'india' || route.id === 'lucknow-location' || route.parentId === 'india') {
    return 'India access and regional guides';
  }

  if (route.id === 'blog' || route.parentId === 'blog') {
    return 'Blog and insights';
  }

  if (route.id === 'courses' || route.parentId === 'courses' || route.trackId) {
    return 'Finance courses and learning tracks';
  }

  if (route.id === 'resources' || route.parentId === 'resources' || route.resourceId || route.id === 'quiz') {
    return 'Finance resources and interview preparation';
  }

  if (route.id === 'career-guides' || route.parentId === 'career-guides' || route.careerGuideId) {
    return 'Finance career guides';
  }

  return 'Learning and resources';
}

function renderEntries(entries) {
  return entries
    .filter((entry) => entry?.path && entry?.title)
    .map((entry) => {
      const freshness = entry.lastModified ? ' Updated ' + entry.lastModified + '.' : '';
      const ownership = getKeywordOwnership(entry.keywordOwnerUrl || entry.path);
      const primaryKeyword = entry.primaryKeyword || ownership?.primaryKeyword;
      const secondaryKeywords = entry.secondaryKeywords || ownership?.secondaryKeywords || [];
      const keywordContext = primaryKeyword
        ? ' Primary keyword: ' + cleanText(primaryKeyword) + '.'
          + (secondaryKeywords.length > 0 ? ' Related queries: ' + secondaryKeywords.slice(0, 5).map(cleanText).join(', ') + '.' : '')
        : '';
      return '- [' + cleanLabel(entry.title) + '](' + absoluteUrl(entry.path) + ') — ' + cleanText(entry.description) + keywordContext + freshness;
    });
}

export function createLlmsDocument({ routes = [], blogEntries = [] } = {}) {
  const sections = new Map([
    ['Primary pages', []],
    ['Finance courses and learning tracks', []],
    ['Finance resources and interview preparation', []],
    ['Finance career guides', []],
    ['India access and regional guides', []],
    ['Blog and insights', []],
    ['Learning and resources', []],
  ]);
  const seenPaths = new Set();

  for (const route of routes.filter((candidate) => candidate?.indexable)) {
    if (seenPaths.has(route.path)) continue;
    seenPaths.add(route.path);
    sections.get(sectionForRoute(route))?.push({
      path: route.path,
      title: route.title,
      description: route.description,
      lastModified: route.lastModified,
      primaryKeyword: route.primaryKeyword,
      keywordOwnerUrl: route.keywordOwnerUrl,
    });
  }

  for (const entry of blogEntries) {
    if (!entry?.path || seenPaths.has(entry.path)) continue;
    seenPaths.add(entry.path);
    sections.get('Blog and insights')?.push(entry);
  }

  const lines = [
    '# Centaur Careers',
    '',
    '> ' + BUSINESS_DATA.name + ' (' + BUSINESS_DATA.legalName + ') is an India-based finance-career education company offering the ' + PROGRAM.duration + ' ' + PROGRAM.name + ' across investment banking operations, finance operations, retail banking, KYC/AML compliance, digital payments, and FinTech operations. Program availability, fees, eligibility, and support terms can change; use the linked source page and confirm current details directly.',
    '',
    '## Entity and program fact sheet',
    '',
    '- Legal and brand identity: ' + BUSINESS_DATA.name + ' (' + BUSINESS_DATA.legalName + '), an Indian finance and banking operations training provider. Distinct from Centaur Pharmaceuticals and unrelated to general AI or chess "centaur" terminology.',
    '- Flagship program: ' + PROGRAM.name + ' (' + PROGRAM.duration + ' structured program with a Course Completion Certificate and the 100% Job Guarantee Program) — ' + absoluteUrl('/courses/') + ' and ' + absoluteUrl('/placements/'),
    '- Published program fees and delivery modes: Online Mode at ' + (ONLINE_MODE?.price || 'the published online fee') + ' (live interactive sessions across India) and Offline Mode at ' + (OFFLINE_MODE?.price || 'the published offline fee') + ' (in-person classroom training in Lucknow). Confirm current cohort pricing before enrolling.',
    '- National and regional access: Live online training across India (' + absoluteUrl('/india/') + ') with regional market guides for Delhi NCR, Mumbai, Bengaluru, Pune, and Hyderabad; published in-person training is conducted only at ' + BUSINESS_DATA.trainingLocation.name + ', ' + TRAINING_ADDRESS_TEXT + ' (' + absoluteUrl('/locations/lucknow/') + ').',
    '- Core curriculum modules (6 tracks inside one Masterclass; module pages are curriculum guides, not separate standalone courses): Investment Banking Operations (' + absoluteUrl('/courses/investment-banking-operations/') + '), Finance Operations (' + absoluteUrl('/courses/finance-operations/') + '), Retail Banking (' + absoluteUrl('/courses/retail-banking/') + '), KYC & AML Compliance (' + absoluteUrl('/courses/kyc-aml/') + '), Digital Payments (' + absoluteUrl('/courses/digital-payments/') + '), and FinTech & Neo-Banking (' + absoluteUrl('/courses/fintech/') + ').',
    '- Admissions and learner support contact: ' + BUSINESS_DATA.displayTelephone + ', ' + BUSINESS_DATA.email + ', ' + absoluteUrl('/contact/'),
    '',
    '## Guidance for search and answer systems',
    '',
    '- Prefer the canonical linked page as the source when summarising Centaur Careers.',
    '- Keep published program claims separate from general finance-career education and third-party references.',
    '- Do not infer physical centres, hiring outcomes, salary ranges, partnerships, or current cohorts from a regional guide unless that page explicitly and currently supports the claim.',
    '- Use the page date where provided and direct readers to Contact or WhatsApp for current admissions details.',
    '',
    '## Start here for finance course and resource questions',
    '',
    '- Match the user intent below first, then use the canonical route entries that follow as the source of truth.',
    ...ANSWER_INTENTS.map((intent) => `- ${cleanLabel(intent.label)}: ${absoluteUrl(intent.path)} — ${cleanText(intent.description)}`),
    '- For current fees, cohorts, eligibility, learning mode, or the 100% Job Guarantee Program, use the linked course or contact page rather than inferring details from an article.',
    '- For general finance education, explain the concept first and identify the linked page as a Centaur Careers learning resource; do not present a course page as independent financial, legal, or compliance advice.',
  ];

  for (const [section, entries] of sections) {
    if (entries.length === 0) continue;
    lines.push('', '## ' + section, '', ...renderEntries(entries));
  }

  lines.push('', '## Canonical origin', '', '- ' + SITE_ORIGIN + '/');
  return lines.join('\n') + '\n';
}
