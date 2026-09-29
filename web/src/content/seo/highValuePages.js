import { KEYWORD_PAGE_ARCHITECTURE } from './keywordStrategy.js';
import { REGIONAL_PAGES } from '../regionalPages.js';

// Phase 3 owns the highest-priority strategy destinations. The threshold is
// deliberately derived from the approved architecture rather than from page
// traffic guesses or unverified third-party metrics.
const HIGH_VALUE_PRIORITY_THRESHOLD = 90;
const REGIONAL_PRIORITY_THRESHOLD = 88;

const PAGE_REQUIREMENTS = Object.freeze({
  '/courses/': Object.freeze({
    pageMarker: 'courses',
    role: 'Primary commercial program hub',
    conversionPath: '/contact/',
    minimumVisibleWords: 650,
    requiredMarkers: Object.freeze([
      'data-commercial-section="program-modules"',
      'data-commercial-section="program-benefits"',
      'data-commercial-section="learning-modes"',
      'data-commercial-section="program-comparison"',
      'data-commercial-section="program-faq"',
      'data-high-value-section="commercial-decision"',
    ]),
    requiredLinks: Object.freeze(['/india/', '/placements/', '/contact/', '/career-guides/']),
    requiredTerms: Object.freeze([
      'investment banking operations course',
      'financial operations masterclass',
      'online',
      'offline',
      '100% job guarantee program',
      'course completion certificate',
    ]),
  }),
  '/locations/lucknow/': Object.freeze({
    pageMarker: 'lucknow-location',
    role: 'Verified local acquisition page',
    conversionPath: '/contact/',
    minimumVisibleWords: 450,
    requiredMarkers: Object.freeze([
      'data-commercial-section="location-details"',
      'data-commercial-section="location-program-access"',
      'data-commercial-section="local-faq"',
      'data-location-address',
      'data-high-value-section="local-decision"',
    ]),
    requiredLinks: Object.freeze(['/courses/', '/contact/', '/placements/', '/faqs/']),
    requiredTerms: Object.freeze([
      'investment banking course in lucknow',
      'alambagh',
      'mindsprout career hub',
      'in-person sessions',
      'current cohort',
    ]),
  }),
  '/courses/kyc-aml/': Object.freeze({
    pageMarker: 'kyc-aml-compliance',
    role: 'High-priority KYC and AML module bridge',
    conversionPath: '/contact/',
    minimumVisibleWords: 500,
    requiredMarkers: Object.freeze([
      'data-informational-module="kyc-aml-compliance"',
      'data-high-value-section="module-commercial-bridge"',
      'data-commercial-section="decision-checklist"',
    ]),
    requiredLinks: Object.freeze(['/courses/', '/placements/', '/contact/']),
    requiredTerms: Object.freeze([
      'kyc aml course',
      'customer due diligence',
      'screening',
      'transaction monitoring',
      'case documentation',
      'not a separate course',
    ]),
  }),
  '/india/': Object.freeze({
    pageMarker: 'india',
    role: 'National commercial access hub',
    conversionPath: '/courses/',
    visiblePrimaryPhrase: 'investment banking operations course in India',
    minimumVisibleWords: 700,
    requiredMarkers: Object.freeze([
      'data-national-page="india"',
      'data-national-direct-answer',
      'data-national-operations-map',
      'data-regional-guides',
      'data-national-faq="india"',
      'data-high-value-section="national-commercial-bridge"',
    ]),
    requiredLinks: Object.freeze(['/courses/', '/locations/lucknow/', '/career-guides/', '/resources/', '/contact/']),
    requiredTerms: Object.freeze([
      'investment banking operations course in india',
      'live online',
      'across india',
      'lucknow',
      'published in-person option',
      'reference data management',
      'fund accounting',
      'client onboarding',
    ]),
  }),
  '/career-guides/choosing-finance-career-course/': Object.freeze({
    pageMarker: 'career-guide-choosing-finance-career-course',
    role: 'Commercial investigation and course-selection guide',
    conversionPath: '/courses/',
    minimumVisibleWords: 650,
    requiredMarkers: Object.freeze([
      'data-career-guide="choosing-finance-career-course"',
      'data-high-value-section="course-selection"',
      'data-career-guide-related',
    ]),
    requiredLinks: Object.freeze(['/courses/', '/placements/', '/compare/investment-banking-operations-courses/']),
    requiredTerms: Object.freeze([
      'finance course',
      'investment banking course with placement support',
      'syllabus',
      'practical learning',
      'credential',
      'support terms',
    ]),
  }),
});

const REGIONAL_PAGE_REQUIREMENTS = Object.freeze(Object.fromEntries(
  REGIONAL_PAGES.map((page) => [page.path, Object.freeze({
    pageMarker: page.routeId,
    role: `${page.regionName} regional commercial and access guide`,
    conversionPath: '/contact/',
    priorityThreshold: REGIONAL_PRIORITY_THRESHOLD,
    minimumVisibleWords: 400,
    requiredMarkers: Object.freeze([
      `data-regional-page="${page.id}"`,
      'data-regional-direct-answer',
      'data-regional-program-answer',
      'data-regional-online-access',
      'data-regional-evidence',
      `data-regional-faq="${page.id}"`,
      'data-regional-role-example',
      'data-high-value-section="regional-commercial-bridge"',
    ]),
    requiredLinks: Object.freeze(['/india/', '/courses/', '/placements/', '/contact/']),
    requiredTerms: Object.freeze([
      page.primaryKeyword.toLowerCase(),
      page.regionName.toLowerCase(),
      'live online',
      'published in-person option',
      'one six-week financial operations masterclass',
    ]),
  })]),
));

const ALL_PAGE_REQUIREMENTS = Object.freeze({ ...PAGE_REQUIREMENTS, ...REGIONAL_PAGE_REQUIREMENTS });

const prioritizedPages = KEYWORD_PAGE_ARCHITECTURE
  .filter((page) => page.topPriority >= HIGH_VALUE_PRIORITY_THRESHOLD
    || (page.topPriority >= REGIONAL_PRIORITY_THRESHOLD && REGIONAL_PAGE_REQUIREMENTS[page.targetUrl]))
  .sort((left, right) => right.topPriority - left.topPriority || left.targetUrl.localeCompare(right.targetUrl));

for (const page of prioritizedPages) {
  if (!ALL_PAGE_REQUIREMENTS[page.targetUrl]) {
    throw new Error(`Phase 3 high-value page requirements are missing for ${page.targetUrl}`);
  }
}

export const HIGH_VALUE_PAGE_PRIORITY_THRESHOLD = HIGH_VALUE_PRIORITY_THRESHOLD;

export const HIGH_VALUE_PAGE_CONTRACTS = Object.freeze(
  prioritizedPages.map((page) => Object.freeze({
    targetUrl: page.targetUrl,
    priority: page.topPriority,
    keywordCount: page.mappedKeywordCount,
    ...ALL_PAGE_REQUIREMENTS[page.targetUrl],
  })),
);

export const HIGH_VALUE_PAGE_PATHS = Object.freeze(HIGH_VALUE_PAGE_CONTRACTS.map((page) => page.targetUrl));

export function getHighValuePageContract(targetUrl) {
  return HIGH_VALUE_PAGE_CONTRACTS.find((page) => page.targetUrl === targetUrl) || null;
}
