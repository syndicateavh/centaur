// Primary search intent for published blog posts that predate the required
// focusKeyword field. Keep one clear query owner per article; use the article
// body and title to validate the wording before publishing changes.
const BLOG_KEYWORD_OVERRIDES = Object.freeze({
  'balance-sheet-meaning-format-example': Object.freeze({
    primaryKeyword: 'balance sheet meaning',
    secondaryKeywords: Object.freeze(['balance sheet format', 'balance sheet example', 'assets liabilities and equity']),
  }),
  'career-options-in-commerce-decision-map': Object.freeze({
    primaryKeyword: 'career options in commerce',
    secondaryKeywords: Object.freeze(['commerce career options', 'commerce careers', 'finance career paths']),
  }),
  'commercial-banks-services-operations': Object.freeze({
    primaryKeyword: 'commercial bank services',
    secondaryKeywords: Object.freeze(['commercial bank meaning', 'commercial banking operations', 'commercial bank functions']),
  }),
  'corporate-actions-analyst-career-path': Object.freeze({
    primaryKeyword: 'corporate actions analyst',
    secondaryKeywords: Object.freeze(['corporate actions operations', 'corporate actions career', 'corporate actions process']),
  }),
  'cost-accounting-methods-examples': Object.freeze({
    primaryKeyword: 'cost accounting methods',
    secondaryKeywords: Object.freeze(['cost accounting examples', 'cost allocation methods', 'cost and management accounting']),
  }),
  'digital-payments-operations-career-india': Object.freeze({
    primaryKeyword: 'digital payments operations career',
    secondaryKeywords: Object.freeze(['digital payments jobs', 'payment operations analyst', 'digital payments career in India']),
  }),
  'finance-operations-portfolio-projects-freshers': Object.freeze({
    primaryKeyword: 'finance operations projects for freshers',
    secondaryKeywords: Object.freeze(['finance portfolio projects', 'finance projects for graduates', 'operations analyst projects']),
  }),
  'finance-process-associate-role': Object.freeze({
    primaryKeyword: 'finance process associate',
    secondaryKeywords: Object.freeze(['finance process associate role', 'finance process associate skills', 'banking process associate']),
  }),
  'financial-accounting-statements-process-examples': Object.freeze({
    primaryKeyword: 'financial accounting process',
    secondaryKeywords: Object.freeze(['financial accounting statements', 'accounting cycle steps', 'financial accounting example']),
  }),
  'financial-crime-analyst-kyc-aml-career-guide': Object.freeze({
    primaryKeyword: 'financial crime analyst',
    secondaryKeywords: Object.freeze(['financial crime analyst career', 'KYC AML analyst roles', 'financial crime jobs']),
  }),
  'financial-management-decisions-controls': Object.freeze({
    primaryKeyword: 'financial management',
    secondaryKeywords: Object.freeze(['financial management functions', 'financial management decisions', 'financial controls']),
  }),
  'financial-market-intermediaries': Object.freeze({
    primaryKeyword: 'financial market intermediaries',
    secondaryKeywords: Object.freeze(['financial intermediaries', 'types of financial intermediaries', 'market intermediary roles']),
  }),
  'financial-markets-instruments-participants-operations': Object.freeze({
    primaryKeyword: 'financial markets and instruments',
    secondaryKeywords: Object.freeze(['financial market participants', 'types of financial instruments', 'financial market operations']),
  }),
  'financial-products-and-services-banking': Object.freeze({
    primaryKeyword: 'financial products and services',
    secondaryKeywords: Object.freeze(['banking products and services', 'types of financial products', 'financial services explained']),
  }),
  'fintech-operations-careers-after-graduation': Object.freeze({
    primaryKeyword: 'fintech careers after graduation',
    secondaryKeywords: Object.freeze(['fintech jobs for graduates', 'fintech operations career', 'fintech career in India']),
  }),
  'fund-accounting-nav-workflow-career-skills': Object.freeze({
    primaryKeyword: 'fund accounting NAV',
    secondaryKeywords: Object.freeze(['fund accounting workflow', 'NAV calculation process', 'fund accounting career']),
  }),
  'how-to-choose-kyc-aml-course-india': Object.freeze({
    primaryKeyword: 'best KYC AML course in India',
    secondaryKeywords: Object.freeze(['KYC AML course', 'AML training in India', 'KYC analyst course']),
  }),
  'investment-banking-operations-vs-cfa-financial-modelling': Object.freeze({
    primaryKeyword: 'investment banking vs CFA',
    secondaryKeywords: Object.freeze(['investment banking operations vs financial modelling', 'CFA vs investment banking', 'finance career comparison']),
  }),
  'investment-banking-teams-operations': Object.freeze({
    primaryKeyword: 'investment banking teams',
    secondaryKeywords: Object.freeze(['investment banking departments', 'investment banking operations', 'investment banking roles']),
  }),
  'kyc-onboarding-case-file-example': Object.freeze({
    primaryKeyword: 'KYC onboarding process',
    secondaryKeywords: Object.freeze(['KYC case study', 'customer due diligence process', 'KYC analyst workflow']),
  }),
  'loan-operations-banking-roles-skills-career-path': Object.freeze({
    primaryKeyword: 'loan operations in banking',
    secondaryKeywords: Object.freeze(['loan operations roles', 'loan processing jobs', 'loan operations analyst skills']),
  }),
  'neo-banking-products-controls': Object.freeze({
    primaryKeyword: 'neo banking products',
    secondaryKeywords: Object.freeze(['neo banking meaning', 'digital banking products', 'neo bank controls']),
  }),
  'risk-management-in-banking': Object.freeze({
    primaryKeyword: 'risk management in banking',
    secondaryKeywords: Object.freeze(['banking risk management types', 'banking risk controls', 'risk analyst banking']),
  }),
  'settlement-trade-break-worked-example': Object.freeze({
    primaryKeyword: 'trade settlement break',
    secondaryKeywords: Object.freeze(['settlement break investigation', 'trade settlement operations', 'trade break resolution']),
  }),
  'trial-balance-format-errors-reconciliation': Object.freeze({
    primaryKeyword: 'trial balance errors',
    secondaryKeywords: Object.freeze(['trial balance format', 'trial balance mistakes', 'trial balance reconciliation']),
  }),
});

const BLOG_CATEGORY_KEYWORDS = Object.freeze({
  'career-guides': Object.freeze({
    primaryKeyword: 'finance career blog',
    secondaryKeywords: Object.freeze(['finance career guides', 'finance career advice', 'banking career blog']),
  }),
  'finance-operations': Object.freeze({
    primaryKeyword: 'finance operations blog',
    secondaryKeywords: Object.freeze(['finance operations careers', 'finance operations skills', 'banking operations blog']),
  }),
  'industry-updates': Object.freeze({
    primaryKeyword: 'finance industry updates',
    secondaryKeywords: Object.freeze(['banking industry news', 'finance industry insights', 'BFSI updates']),
  }),
  'interview-preparation': Object.freeze({
    primaryKeyword: 'finance interview preparation',
    secondaryKeywords: Object.freeze(['banking interview preparation', 'finance interview questions', 'BFSI interview guide']),
  }),
  'investment-banking': Object.freeze({
    primaryKeyword: 'investment banking blog',
    secondaryKeywords: Object.freeze(['investment banking insights', 'investment banking operations', 'investment banking careers']),
  }),
  'lucknow-careers': Object.freeze({
    primaryKeyword: 'finance careers in Lucknow',
    secondaryKeywords: Object.freeze(['Lucknow finance jobs', 'banking careers in Lucknow', 'finance course Lucknow']),
  }),
  'retail-banking': Object.freeze({
    primaryKeyword: 'retail banking blog',
    secondaryKeywords: Object.freeze(['retail banking operations', 'retail banking careers', 'banking services explained']),
  }),
});

export function getBlogKeywordOwnership(post) {
  if (!post) return null;

  const focusKeyword = post.seo?.focusKeyword?.trim();
  if (focusKeyword) {
    return {
      primaryKeyword: focusKeyword,
      secondaryKeywords: Object.freeze(Array.isArray(post.seo?.secondaryKeywords) ? post.seo.secondaryKeywords : []),
      source: 'post.seo.focusKeyword',
    };
  }

  const override = BLOG_KEYWORD_OVERRIDES[post.slug];
  return override
    ? { ...override, source: 'governed-blog-keyword-map' }
    : null;
}

export function getBlogCategoryKeywordOwnership(category) {
  return BLOG_CATEGORY_KEYWORDS[category] || null;
}

export { BLOG_CATEGORY_KEYWORDS, BLOG_KEYWORD_OVERRIDES };
