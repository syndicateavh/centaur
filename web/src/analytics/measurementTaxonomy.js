export const REGIONAL_MARKETS = Object.freeze({
  '/best-finance-course-in-delhi/': 'delhi_ncr',
  '/best-finance-course-in-bangalore/': 'bengaluru',
  '/best-finance-course-in-mumbai/': 'mumbai',
  '/best-finance-course-in-pune/': 'pune',
  '/best-finance-course-in-hyderabad/': 'hyderabad',
});

// These root-level landing pages do not share a path prefix. Match their full
// paths so that unrelated URLs cannot inherit a commercial classification.
const INDIA_LEAD_INTENT_PAGES = Object.freeze({
  '/best-finance-course-in-india-with-placement/': ['commercial', 'courses', 'online_and_lucknow_in_person', 'commercial_placement', 'evaluate'],
  '/best-investment-banking-course-india/': ['commercial', 'courses', 'online_and_lucknow_in_person', 'commercial_program', 'evaluate'],
  '/best-finance-course-after-graduation/': ['commercial', 'courses', 'online_and_lucknow_in_person', 'career_fit', 'evaluate'],
  '/best-finance-course-after-bcom/': ['commercial', 'courses', 'online_and_lucknow_in_person', 'career_fit', 'evaluate'],
  '/finance-course-with-placement/': ['commercial', 'courses', 'online_and_lucknow_in_person', 'commercial_placement', 'decide'],
  '/finance-course-with-job-guarantee/': ['commercial', 'courses', 'online_and_lucknow_in_person', 'commercial_placement', 'decide'],
  '/finance-course-fees-in-india/': ['commercial', 'courses', 'online_and_lucknow_in_person', 'commercial_fees', 'decide'],
  '/finance-course-duration/': ['commercial', 'courses', 'online_and_lucknow_in_person', 'commercial_program', 'evaluate'],
  '/finance-course-eligibility/': ['commercial', 'courses', 'online_and_lucknow_in_person', 'commercial_program', 'decide'],
  '/online-finance-course-with-placement/': ['commercial', 'courses', 'online_across_india', 'commercial_placement', 'evaluate'],
  '/job-oriented-finance-course-india/': ['commercial', 'courses', 'online_and_lucknow_in_person', 'commercial_program', 'evaluate'],
  '/banking-finance-course-with-placement/': ['commercial', 'courses', 'online_and_lucknow_in_person', 'commercial_placement', 'evaluate'],
  '/investment-banking-operations-course-with-placement/': ['commercial', 'courses', 'online_and_lucknow_in_person', 'commercial_placement', 'evaluate'],
  '/finance-institute-lucknow-with-placement/': ['commercial', 'locations', 'in_person_lucknow', 'commercial_placement', 'evaluate'],
  '/finance-course-cities-india/': ['comparison', 'national', 'online_across_india', 'commercial_mode', 'evaluate'],
  '/finance-course-vs-mba-cfa-financial-modelling/': ['comparison', 'comparisons', 'sitewide', 'comparison_path', 'evaluate'],
  '/which-finance-course-is-right-for-me/': ['career_guide', 'career_guides', 'sitewide', 'career_fit', 'evaluate'],
});

const LEAD_INTENT_RULES = Object.freeze([
  ['/compare/best-finance-institutes-india/', 'commercial_best_institute', 'evaluate'],
  ['/blog/how-to-evaluate-finance-institute-reviews/', 'trust_support', 'trust'],
  ['/blog/questions-to-ask-finance-institute-before-enrolling/', 'trust_support', 'trust'],
  ['/placements/', 'commercial_placement', 'decide'],
  ['/courses/finance-course-fees-eligibility/', 'commercial_fees', 'decide'],
  ['/courses/finance-operations-syllabus/', 'commercial_fees', 'evaluate'],
  ['/compare/online-vs-offline-finance-training/', 'commercial_mode', 'evaluate'],
  ['/compare/', 'comparison_path', 'evaluate'],
  ['/india/', 'commercial_mode', 'evaluate'],
  ['/locations/', 'regional_access', 'decide'],
  ['/quiz/', 'decision_quiz', 'decide'],
  ['/career-guides/choosing-finance-career-course/', 'career_fit', 'evaluate'],
  ['/career-guides/finance-careers-after-graduation/', 'career_fit', 'discover'],
  ['/courses/', 'commercial_program', 'evaluate'],
  ['/contact/', 'commercial_program', 'decide'],
  ['/blog/', 'informational_support', 'discover'],
  ['/career-guides/', 'career_fit', 'discover'],
  ['/resources/', 'informational_support', 'discover'],
]);

const CONTENT_CLUSTERS = Object.freeze([
  ['/', 'home'],
  ['/india/', 'national'],
  ['/courses/', 'courses'],
  ['/compare/', 'comparisons'],
  ['/career-guides/', 'career_guides'],
  ['/resources/', 'resources'],
  ['/blog/', 'blog'],
  ['/quiz/', 'assessment'],
  ['/locations/', 'locations'],
  ['/placements/', 'placements'],
  ['/contact/', 'conversion'],
  ['/about/', 'about'],
  ['/privacy-policy/', 'legal'],
  ['/terms-and-conditions/', 'legal'],
  ['/cookie-policy/', 'legal'],
  ['/refund-cancellation-policy/', 'legal'],
  ['/disclaimer/', 'legal'],
]);

function normalizePath(pathname) {
  const rawPath = String(pathname || '/').split(/[?#]/, 1)[0] || '/';
  const withLeadingSlash = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  if (withLeadingSlash === '/') return '/';
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
}

function getContentCluster(path) {
  if (REGIONAL_MARKETS[path]) return 'regional';
  return CONTENT_CLUSTERS.find(([prefix]) => prefix === '/'
    ? path === '/'
    : path === prefix || path.startsWith(prefix))?.[1] || 'site';
}

function getPageType(path, contentCluster) {
  if (contentCluster === 'regional') return 'regional_guide';
  if (contentCluster === 'national') return 'india_landing';
  if (contentCluster === 'courses') return 'course';
  if (contentCluster === 'comparisons') return 'comparison';
  if (contentCluster === 'career_guides') return 'career_guide';
  if (contentCluster === 'resources') return 'resource';
  if (contentCluster === 'blog') return 'blog';
  if (contentCluster === 'assessment') return 'assessment';
  if (contentCluster === 'locations') return 'location';
  if (contentCluster === 'legal') return 'legal';
  if (contentCluster === 'home') return 'home';
  if (contentCluster === 'conversion' || contentCluster === 'placements') return 'commercial';
  return path === '/' ? 'home' : 'page';
}

function getAccessScope(path, contentCluster) {
  if (REGIONAL_MARKETS[path]) return 'online_from_regional_market';
  if (contentCluster === 'national') return 'online_across_india';
  if (path === '/best-finance-course-in-lucknow/') return 'in_person_lucknow';
  if (contentCluster === 'courses' || contentCluster === 'placements') return 'online_and_lucknow_in_person';
  return 'sitewide';
}

function getLeadIntentFields(path) {
  const match = LEAD_INTENT_RULES.find(([prefix]) => path === prefix || path.startsWith(prefix));
  if (!match) return { lead_intent_group: 'site_discovery', conversion_stage: 'discover' };
  return { lead_intent_group: match[1], conversion_stage: match[2] };
}

/**
 * Return stable, non-identifying labels for analytics reporting.
 * These describe the published URL, not the visitor's physical location.
 */
export function getMeasurementEventFields(pathname) {
  const path = normalizePath(pathname);
  const exactLeadPage = INDIA_LEAD_INTENT_PAGES[path];
  if (exactLeadPage) {
    const [page_type, content_cluster, access_scope, lead_intent_group, conversion_stage] = exactLeadPage;
    return { page_type, content_cluster, access_scope, lead_intent_group, conversion_stage };
  }
  const contentCluster = getContentCluster(path);
  const fields = {
    page_type: getPageType(path, contentCluster),
    content_cluster: contentCluster,
    access_scope: getAccessScope(path, contentCluster),
    ...getLeadIntentFields(path),
  };
  const regionalMarket = REGIONAL_MARKETS[path];
  if (regionalMarket) fields.regional_market = regionalMarket;
  return fields;
}

export const MEASUREMENT_TAXONOMY = Object.freeze({
  regionalMarkets: Object.freeze({ ...REGIONAL_MARKETS }),
  regionalOnlineOwner: '/india/',
  leadIntentGroups: Object.freeze([
    'commercial_best_institute',
    'commercial_placement',
    'commercial_fees',
    'commercial_mode',
    'commercial_program',
    'comparison_path',
    'career_fit',
    'decision_quiz',
    'informational_support',
    'regional_access',
    'site_discovery',
    'trust_support',
  ]),
  eventFields: Object.freeze(['page_type', 'content_cluster', 'access_scope', 'regional_market', 'lead_intent_group', 'conversion_stage']),
});
