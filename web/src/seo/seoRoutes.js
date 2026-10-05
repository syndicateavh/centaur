import { BUSINESS_DATA, ORGANIZATION_ID, WEBSITE_ID } from '../content/businessData.js';
import { CAREER_GUIDE_HUB, CAREER_GUIDES, getCareerGuide } from '../content/careerGuides.js';
import { INFORMATIONAL_MODULES } from '../content/informationalModules.js';
import { COMPARISON_PAGE } from '../content/comparisonPage.js';
import { GENERAL_FAQS } from '../content/faqData.js';
import { INDIA_PAGE } from '../content/indiaPage.js';
import { LEGAL_PAGES } from '../content/legalContent.js';
import { REGIONAL_PAGES } from '../content/regionalPages.js';
import { RESOURCE_HUB, RESOURCES, getResource } from '../content/resources.js';
import { FINANCE_QUIZ_DOMAINS, FINANCE_QUIZ_TOTAL } from '../content/quizLibrary.js';
import { PRIORITY_NON_ARTICLE_ROUTES } from '../content/prioritySeoContent.js';
import { CAREER_TRACKS, LEADERSHIP, LEARNING_MODES, PROGRAM } from '../content/sourceContent.js';
import { TOPIC_PROGRAM_REVIEW_DATE } from '../content/topicProgramPaths.js';
import { getKeywordOwnership } from './keywordMap.js';
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_WIDTH,
  SITE_ORIGIN,
} from './siteConfig.js';
import { createOrganizationSchema, createWebsiteSchema } from './entitySeo.js';

export { DEFAULT_OG_IMAGE, SITE_ORIGIN } from './siteConfig.js';
export {
  ORGANIZATION_DISAMBIGUATING_DESCRIPTION,
  ORGANIZATION_KNOWS_ABOUT,
  createOrganizationSchema,
  createWebsiteSchema,
} from './entitySeo.js';

const LAST_MEANINGFUL_UPDATE = '2026-09-13';
const PAGE_IMAGES = Object.freeze({
  courses: Object.freeze({ path: '/images/courses/investment-banking-operations.jpg', alt: 'Investment banking operations and finance training topics', width: 1536, height: 1024 }),
  'investment-banking-operations': Object.freeze({ path: '/images/courses/investment-banking-operations.jpg', alt: 'Investment banking operations training topics', width: 1536, height: 1024 }),
  'retail-banking': Object.freeze({ path: '/images/courses/retail-banking.jpg', alt: 'Retail banking operations training topics', width: 1536, height: 1024 }),
  'career-guide-investment-banking-operations': Object.freeze({ path: '/images/blog/investment-banking-teams-operations.png', alt: 'Investment banking operations career workflow', width: 1672, height: 941 }),
  'career-guide-finance-operations': Object.freeze({ path: '/images/courses/finance-operations.jpg', alt: 'Finance operations and credit training topics', width: 1536, height: 1024 }),
  'resource-reconciliation-in-finance': Object.freeze({ path: '/images/blog/settlement-trade-break-worked-example.png', alt: 'Reconciliation and settlement break workflow', width: 1672, height: 941 }),
});
const CAREER_GUIDE_ROUTES = CAREER_GUIDES.map((guide) => ({
  id: guide.routeId,
  parentId: 'career-guides',
  path: guide.path,
  title: guide.title,
  description: guide.description,
  h1: guide.h1,
  breadcrumbLabel: guide.breadcrumbLabel,
  schemaType: 'WebPage',
  careerGuideId: guide.id,
  keywordPurpose: 'First-party career-guide information page',
  primaryKeyword: guide.primaryKeyword,
  keywordOwnerUrl: guide.keywordOwnerUrl ?? (getKeywordOwnership(guide.path)?.primaryKeyword === guide.primaryKeyword ? guide.path : null),
  image: guide.image || PAGE_IMAGES[guide.routeId]?.path,
  imageAlt: guide.imageAlt || PAGE_IMAGES[guide.routeId]?.alt,
  imageWidth: guide.imageWidth || PAGE_IMAGES[guide.routeId]?.width,
  imageHeight: guide.imageHeight || PAGE_IMAGES[guide.routeId]?.height,
  indexable: true,
  lastModified: guide.updatedAt,
}));

const INFORMATIONAL_MODULE_ROUTES = INFORMATIONAL_MODULES.map((module) => ({
  id: module.routeId,
  parentId: 'courses',
  path: module.path,
  title: module.title,
  description: module.description,
  h1: module.h1,
  breadcrumbLabel: module.breadcrumbLabel,
  schemaType: 'WebPage',
  informationalModuleId: module.id,
  keywordPurpose: 'Informational guide to a subject taught within the Financial Operations Masterclass',
  primaryKeyword: module.primaryKeyword,
  keywordOwnerUrl: module.path,
  indexable: true,
  lastModified: module.updatedAt,
}));

const RESOURCE_ROUTES = RESOURCES.map((resource) => ({
  id: resource.routeId,
  parentId: 'resources',
  path: resource.path,
  title: resource.title,
  description: resource.description,
  h1: resource.h1,
  breadcrumbLabel: resource.breadcrumbLabel,
  schemaType: 'WebPage',
  resourceId: resource.id,
  keywordPurpose: resource.kind === 'learning'
    ? 'First-party finance and BFSI learning resource'
    : 'First-party finance interview preparation resource',
  primaryKeyword: resource.primaryKeyword,
  keywordOwnerUrl: resource.keywordOwnerUrl,
  image: resource.image || PAGE_IMAGES[resource.routeId]?.path,
  imageAlt: resource.imageAlt || PAGE_IMAGES[resource.routeId]?.alt,
  imageWidth: resource.imageWidth || PAGE_IMAGES[resource.routeId]?.width,
  imageHeight: resource.imageHeight || PAGE_IMAGES[resource.routeId]?.height,
  indexable: true,
  lastModified: resource.updatedAt,
}));

const REGIONAL_ROUTES = REGIONAL_PAGES.map((page) => ({
  id: page.routeId,
  parentId: INDIA_PAGE.id,
  path: page.path,
  title: page.title,
  description: page.description,
  h1: page.h1,
  image: page.image,
  imageAlt: page.imageAlt,
  imageWidth: page.image ? 1672 : undefined,
  imageHeight: page.image ? 941 : undefined,
  breadcrumbLabel: page.breadcrumbLabel,
  schemaType: 'WebPage',
  regional: true,
  regionalPageId: page.id,
  keywordPurpose: 'Selective regional finance-career market and access guide',
  primaryKeyword: page.primaryKeyword,
  keywordOwnerUrl: page.path,
  indexable: true,
  lastModified: page.updatedAt,
}));

export const SEO_ROUTES = Object.freeze([
  {
    id: 'home',
    path: '/',
    title: 'Finance Career Training for Graduates | Centaur Careers',
    description: 'Open to all graduates. Learn finance and BFSI operations in a six-week Masterclass, live online across India or in person in Lucknow.',
    h1: 'Financial Operations Masterclass for Banking and Finance Careers',
    breadcrumbLabel: 'Home',
    schemaType: 'WebPage',
    keywordPurpose: 'Brand/entity and Financial Operations Masterclass overview',
    primaryKeyword: 'Centaur Careers finance training',
    keywordOwnerUrl: null,
    indexable: true,
    lastModified: '2026-09-30',
  },
  {
    id: 'blog',
    parentId: 'home',
    path: '/blog/',
    title: 'Finance Career Insights & Industry Updates | Centaur Careers',
    description: 'Practical finance-career learning, banking operations explainers, industry updates, and interview resources from Centaur Careers.',
    h1: 'Finance Career Insights & Industry Updates',
    breadcrumbLabel: 'Blog',
    schemaType: 'CollectionPage',
    keywordPurpose: 'Finance career learning, industry updates, and interview resources',
    primaryKeyword: 'finance career insights',
    keywordOwnerUrl: null,
    indexable: true,
    lastModified: LAST_MEANINGFUL_UPDATE,
  },
  {
    id: CAREER_GUIDE_HUB.id,
    parentId: 'home',
    path: CAREER_GUIDE_HUB.path,
    title: CAREER_GUIDE_HUB.title,
    description: CAREER_GUIDE_HUB.description,
    h1: CAREER_GUIDE_HUB.h1,
    breadcrumbLabel: CAREER_GUIDE_HUB.breadcrumbLabel,
    schemaType: 'CollectionPage',
    keywordPurpose: 'Career-guide information cluster hub',
    primaryKeyword: 'finance operations career guide',
    keywordOwnerUrl: null,
    indexable: true,
    lastModified: CAREER_GUIDE_HUB.updatedAt,
  },
  {
    id: RESOURCE_HUB.id,
    parentId: 'home',
    path: RESOURCE_HUB.path,
    title: RESOURCE_HUB.title,
    description: RESOURCE_HUB.description,
    h1: RESOURCE_HUB.h1,
    breadcrumbLabel: RESOURCE_HUB.breadcrumbLabel,
    schemaType: 'CollectionPage',
    keywordPurpose: 'Finance interview preparation and career resource hub',
    primaryKeyword: 'finance career resources',
    keywordOwnerUrl: null,
    indexable: true,
    lastModified: LAST_MEANINGFUL_UPDATE,
  },
  ...RESOURCE_ROUTES,
  {
    id: 'quiz',
    parentId: 'home',
    path: '/quiz/',
    title: 'Banking & Finance Career Quiz | Centaur Careers',
    description: 'Practise 1,000+ banking and finance quiz questions across investment banking, retail banking, KYC, AML, payments, credit, risk, accounting and FinTech.',
    h1: 'Banking & Finance Career Quiz',
    breadcrumbLabel: 'Banking and Finance Quiz',
    schemaType: 'WebPage',
    quiz: true,
    keywordPurpose: 'Large first-party banking and finance self-assessment question bank',
    primaryKeyword: 'banking and finance quiz',
    keywords: Object.freeze([
      'banking and finance quiz',
      'finance quiz for freshers',
      'BFSI quiz questions',
      'investment banking operations quiz',
      'KYC AML quiz',
      'digital payments quiz',
      'credit analyst quiz',
      'finance operations interview questions',
      'banking career assessment',
    ]),
    hashtags: Object.freeze(['#BankingQuiz', '#FinanceQuiz', '#BFSICareers', '#FinanceOperations']),
    quizQuestionCount: FINANCE_QUIZ_TOTAL,
    quizDomainCount: FINANCE_QUIZ_DOMAINS.length,
    indexable: true,
    lastModified: '2026-09-22',
  },
  {
    id: 'courses',
    parentId: 'home',
    path: '/courses/',
    title: 'Financial Operations Masterclass | Centaur Careers',
    description: 'A six-week finance operations course for all graduates, covering banking, investment operations, KYC and AML, payments, and credit. Live online across India or in person in Lucknow.',
    h1: PROGRAM.name,
    breadcrumbLabel: 'Financial Operations Masterclass',
    schemaType: 'CollectionPage',
    program: true,
    keywordPurpose: 'Primary commercial finance course and Financial Operations Masterclass hub',
    primaryKeyword: 'financial operations masterclass',
    keywordOwnerUrl: '/courses/',
    image: PAGE_IMAGES.courses.path,
    imageAlt: PAGE_IMAGES.courses.alt,
    imageWidth: PAGE_IMAGES.courses.width,
    imageHeight: PAGE_IMAGES.courses.height,
    indexable: true,
    lastModified: '2026-09-30',
  },
  {
    id: 'investment-banking-operations',
    parentId: 'courses',
    path: '/courses/investment-banking-operations/',
    title: 'Investment Banking Operations Training Module | Centaur Careers',
    description: 'See how trade settlements, reconciliation, corporate actions, and fund accounting are taught as an investment banking operations module within the six-week Financial Operations Masterclass.',
    h1: 'Investment Banking Operations Training',
    breadcrumbLabel: 'Investment Banking Operations',
    schemaType: 'WebPage',
    trackId: 'investment-banking-operations',
    keywordPurpose: 'Supporting Investment Banking Operations module page',
    primaryKeyword: 'investment banking operations module',
    keywordOwnerUrl: null,
    image: PAGE_IMAGES['investment-banking-operations'].path,
    imageAlt: PAGE_IMAGES['investment-banking-operations'].alt,
    imageWidth: PAGE_IMAGES['investment-banking-operations'].width,
    imageHeight: PAGE_IMAGES['investment-banking-operations'].height,
    indexable: true,
    lastModified: '2026-09-30',
  },
  {
    id: 'retail-banking',
    parentId: 'courses',
    path: '/courses/retail-banking/',
    title: 'Retail Banking Operations Module | Centaur Careers',
    description: 'Explore retail banking topics: relationship management, branch operations, loan officer work, and NRI banking in the Financial Operations Masterclass.',
    h1: 'Retail Banking',
    breadcrumbLabel: 'Retail Banking',
    schemaType: 'WebPage',
    trackId: 'retail-banking',
    keywordPurpose: 'Supporting Retail Banking module page',
    primaryKeyword: 'retail banking operations course',
    keywordOwnerUrl: '/courses/retail-banking/',
    image: PAGE_IMAGES['retail-banking'].path,
    imageAlt: PAGE_IMAGES['retail-banking'].alt,
    imageWidth: PAGE_IMAGES['retail-banking'].width,
    imageHeight: PAGE_IMAGES['retail-banking'].height,
    indexable: true,
    lastModified: TOPIC_PROGRAM_REVIEW_DATE,
  },
  {
    id: 'finance-operations',
    parentId: 'courses',
    path: '/courses/finance-operations/',
    title: 'Finance Operations and Credit Training | Centaur Careers',
    description: 'Explore finance operations, loan processing, credit analysis and risk management within the Financial Operations Masterclass.',
    h1: 'Finance Operations and Credit Analysis Training',
    breadcrumbLabel: 'Finance Operations',
    schemaType: 'WebPage',
    trackId: 'finance-operations',
    keywordPurpose: 'Supporting Finance Operations module page',
    primaryKeyword: 'finance operations module',
    keywordOwnerUrl: null,
    image: PAGE_IMAGES['career-guide-finance-operations'].path,
    imageAlt: PAGE_IMAGES['career-guide-finance-operations'].alt,
    imageWidth: PAGE_IMAGES['career-guide-finance-operations'].width,
    imageHeight: PAGE_IMAGES['career-guide-finance-operations'].height,
    indexable: true,
    lastModified: TOPIC_PROGRAM_REVIEW_DATE,
  },
  ...INFORMATIONAL_MODULE_ROUTES,
  {
    id: 'placements',
    parentId: 'home',
    path: '/placements/',
    title: '100% Job Guarantee Program for Finance Careers in India | Centaur Careers',
    description: 'See how Centaur Careers’ 100% Job Guarantee Program works after the six-week finance course, who is eligible, what finance job is guaranteed, and which written terms to confirm.',
    h1: '100% Job Guarantee Program for Finance Careers in India',
    breadcrumbLabel: '100% Job Guarantee',
    schemaType: 'WebPage',
    keywordPurpose: 'Finance job guarantee program, placement process, and published guarantee details',
    primaryKeyword: 'finance course with 100% job guarantee in India',
    keywordOwnerUrl: null,
    indexable: true,
    lastModified: '2026-10-04',
  },
  {
    id: 'student-outcomes',
    parentId: 'home',
    path: '/placements/student-outcomes/',
    title: 'Student Placements and Career Outcomes | Centaur Careers',
    description: 'Meet Centaur Careers learners and explore individual finance career outcomes, roles, employers, and learner stories. Review the separate Job Guarantee Program terms.',
    h1: 'Student Placements and Career Outcomes',
    breadcrumbLabel: 'Student Placements',
    schemaType: 'CollectionPage',
    keywordPurpose: 'First-party learner placement profiles and individual career stories',
    primaryKeyword: 'Centaur Careers student placements',
    keywordOwnerUrl: null,
    indexable: true,
    lastModified: '2026-10-04',
  },
  {
    id: 'about',
    parentId: 'home',
    path: '/about/',
    title: 'About Centaur Careers | Banking & Finance Training',
    description: 'Learn about Centaur Careers and its finance-operations training, course topics, learning access, and current support information for prospective learners.',
    h1: 'About Centaur Careers',
    breadcrumbLabel: 'About',
    schemaType: 'AboutPage',
    keywordPurpose: 'Centaur Careers organization and leadership entity page',
    primaryKeyword: 'Centaur Careers',
    keywordOwnerUrl: null,
    indexable: true,
    lastModified: LAST_MEANINGFUL_UPDATE,
  },
  {
    id: 'contact',
    parentId: 'home',
    path: '/contact/',
    title: 'Contact Centaur Careers | Finance Course Enquiries',
    description: 'Ask Centaur Careers about the six-week finance course, online access across India, the Lucknow location, published fees, and current cohort terms.',
    h1: 'Contact Centaur Careers',
    breadcrumbLabel: 'Contact',
    schemaType: 'ContactPage',
    keywordPurpose: 'Contact and enrolment access for Centaur Careers in Lucknow',
    primaryKeyword: 'Centaur Careers contact',
    keywordOwnerUrl: null,
    indexable: true,
    lastModified: '2026-09-29',
  },
  {
    id: 'privacy-policy',
    parentId: 'home',
    path: '/privacy-policy/',
    title: 'Privacy Policy | Centaur Careers',
    description: LEGAL_PAGES['privacy-policy'].intro,
    h1: LEGAL_PAGES['privacy-policy'].title,
    breadcrumbLabel: 'Privacy Policy',
    schemaType: 'WebPage',
    keywordPurpose: 'Privacy information for website visitors and advertising enquiries',
    primaryKeyword: 'Centaur Careers privacy policy',
    keywordOwnerUrl: null,
    indexable: true,
    lastModified: '2026-09-23',
  },
  {
    id: 'terms-and-conditions',
    parentId: 'home',
    path: '/terms-and-conditions/',
    title: 'Terms and Conditions | Centaur Careers',
    description: LEGAL_PAGES['terms-and-conditions'].intro,
    h1: LEGAL_PAGES['terms-and-conditions'].title,
    breadcrumbLabel: 'Terms and Conditions',
    schemaType: 'WebPage',
    keywordPurpose: 'Website and program-use terms for Centaur Careers',
    primaryKeyword: 'Centaur Careers terms and conditions',
    keywordOwnerUrl: null,
    indexable: true,
    lastModified: '2026-09-30',
  },
  {
    id: 'cookie-policy',
    parentId: 'home',
    path: '/cookie-policy/',
    title: 'Cookie Policy | Centaur Careers',
    description: LEGAL_PAGES['cookie-policy'].intro,
    h1: LEGAL_PAGES['cookie-policy'].title,
    breadcrumbLabel: 'Cookie Policy',
    schemaType: 'WebPage',
    keywordPurpose: 'Cookie, analytics, and advertising technology disclosure',
    primaryKeyword: 'Centaur Careers cookie policy',
    keywordOwnerUrl: null,
    indexable: true,
    lastModified: '2026-09-30',
  },
  {
    id: 'refund-cancellation-policy',
    parentId: 'home',
    path: '/refund-cancellation-policy/',
    title: 'Refund and Cancellation Policy | Centaur Careers',
    description: LEGAL_PAGES['refund-cancellation-policy'].intro,
    h1: LEGAL_PAGES['refund-cancellation-policy'].title,
    breadcrumbLabel: 'Refund and Cancellation Policy',
    schemaType: 'WebPage',
    keywordPurpose: 'Refund and cancellation information for paid program enquiries',
    primaryKeyword: 'Centaur Careers refund policy',
    keywordOwnerUrl: null,
    indexable: true,
    lastModified: '2026-09-30',
  },
  {
    id: 'disclaimer',
    parentId: 'home',
    path: '/disclaimer/',
    title: 'Disclaimer | Centaur Careers',
    description: LEGAL_PAGES.disclaimer.intro,
    h1: LEGAL_PAGES.disclaimer.title,
    breadcrumbLabel: 'Disclaimer',
    schemaType: 'WebPage',
    keywordPurpose: 'Education, career, and program information disclaimer',
    primaryKeyword: 'Centaur Careers disclaimer',
    keywordOwnerUrl: null,
    indexable: true,
    lastModified: '2026-09-30',
  },
  {
    id: INDIA_PAGE.id,
    parentId: 'home',
    path: INDIA_PAGE.path,
    title: INDIA_PAGE.title,
    description: INDIA_PAGE.description,
    h1: INDIA_PAGE.h1,
    breadcrumbLabel: INDIA_PAGE.breadcrumbLabel,
    schemaType: 'WebPage',
    national: true,
    keywordPurpose: 'India-wide online finance operations training access',
    primaryKeyword: INDIA_PAGE.primaryKeyword,
    keywordOwnerUrl: INDIA_PAGE.path,
    indexable: true,
    lastModified: '2026-09-30',
  },
  ...REGIONAL_ROUTES,
  {
    id: 'lucknow-location',
    parentId: 'home',
    path: '/best-finance-course-in-lucknow/',
    title: 'Best Finance Course in Lucknow? | Centaur Careers',
    description: 'Compare finance and investment banking operations training in Lucknow. Explore Centaur Careers’ six-week course in Alambagh and check current cohort details.',
    h1: 'Best Finance Course in Lucknow? Explore Investment Banking Operations',
    breadcrumbLabel: 'Mindsprout Career Hub',
    schemaType: 'WebPage',
    keywordPurpose: 'Evidence-backed local Lucknow acquisition page',
    primaryKeyword: 'investment banking course in Lucknow',
    keywordOwnerUrl: '/best-finance-course-in-lucknow/',
    indexable: true,
    lastModified: '2026-10-05',
  },
  {
    id: 'faqs',
    parentId: 'home',
    path: '/faqs/',
    title: 'Finance Career Program FAQs | Centaur Careers',
    description: 'Answers about the guaranteed finance job, who can join, learning modes, and terms for the Financial Operations Masterclass.',
    h1: 'Finance Career Program FAQs',
    breadcrumbLabel: 'FAQs',
    schemaType: 'FAQPage',
    keywordPurpose: 'Finance career program questions and answer support',
    primaryKeyword: 'finance career program FAQs',
    keywordOwnerUrl: null,
    indexable: true,
    lastModified: LAST_MEANINGFUL_UPDATE,
  },
  ...CAREER_GUIDE_ROUTES,
  ...PRIORITY_NON_ARTICLE_ROUTES,
  {
    id: COMPARISON_PAGE.routeId,
    parentId: 'home',
    path: COMPARISON_PAGE.path,
    title: COMPARISON_PAGE.title,
    description: COMPARISON_PAGE.description,
    h1: COMPARISON_PAGE.h1,
    breadcrumbLabel: COMPARISON_PAGE.breadcrumbLabel,
    schemaType: 'WebPage',
    comparison: true,
    comparisonPageId: COMPARISON_PAGE.id,
    keywordPurpose: 'Factual comparison framework for investment banking operations courses',
    primaryKeyword: COMPARISON_PAGE.primaryKeyword,
    keywordOwnerUrl: COMPARISON_PAGE.path,
    indexable: true,
    lastModified: COMPARISON_PAGE.updatedAt,
  },
  {
    id: 'not-found',
    parentId: 'home',
    path: '/404/',
    title: 'Page Not Found | Centaur Careers',
    description:
      'The requested page could not be found. Return to Centaur Careers or explore our banking and finance career courses.',
    h1: 'Page Not Found',
    breadcrumbLabel: 'Page Not Found',
    schemaType: 'WebPage',
    keywordPurpose: 'Non-indexable missing-page recovery',
    primaryKeyword: null,
    keywordOwnerUrl: null,
    indexable: false,
  },
]);

function validateSeoRoutes(routes) {
  const ids = new Set();
  const paths = new Set();
  const titles = new Set();
  const descriptions = new Set();
  const canonicals = new Set();

  for (const route of routes) {
    if (
      !route.id ||
      !route.path ||
      !route.title ||
      !route.description ||
      !route.h1 ||
      !route.breadcrumbLabel
    ) {
      throw new Error(`SEO route is missing a required field: ${JSON.stringify(route)}`);
    }

    if (!route.path.startsWith('/') || (route.path !== '/' && !route.path.endsWith('/'))) {
      throw new Error(`SEO route paths must use leading and trailing slashes: ${route.path}`);
    }

    const canonical = `${SITE_ORIGIN}${route.path}`;
    const duplicateChecks = [
      [ids, route.id, 'id'],
      [paths, route.path, 'path'],
      [titles, route.title, 'title'],
      [descriptions, route.description, 'description'],
      [canonicals, canonical, 'canonical'],
    ];

    for (const [values, value, label] of duplicateChecks) {
      if (values.has(value)) {
        throw new Error(`Duplicate SEO route ${label}: ${value}`);
      }
      values.add(value);
    }
  }

  for (const route of routes) {
    if (route.parentId && !ids.has(route.parentId)) {
      throw new Error(`Unknown parent route ${route.parentId} for ${route.id}`);
    }
  }
}

validateSeoRoutes(SEO_ROUTES);

export const INDEXABLE_ROUTES = Object.freeze(
  SEO_ROUTES.filter((route) => route.indexable),
);

export const TRAINING_LOCATION_ID = `${SITE_ORIGIN}/best-finance-course-in-lucknow/#place`;
export const PRIMARY_COURSE_ID = `${SITE_ORIGIN}/courses/#course`;

// React Router treats slash-terminated prerender inputs as redirect requests
// for route definitions without a trailing slash. Public URLs remain canonical
// with trailing slashes while build-time requests use route pathnames.
export const PRERENDER_PATHS = Object.freeze(
  SEO_ROUTES.map((route) => (route.path === '/' ? '/' : route.path.slice(0, -1))),
);

export function getSeoRoute(id) {
  const route = SEO_ROUTES.find((candidate) => candidate.id === id);
  if (!route) {
    throw new Error(`Unknown SEO route id: ${id}`);
  }
  return route;
}

export function canonicalUrl(routeOrId) {
  const route = typeof routeOrId === 'string' ? getSeoRoute(routeOrId) : routeOrId;
  return `${SITE_ORIGIN}${route.path}`;
}

export function getBreadcrumbTrail(routeOrId) {
  const route = typeof routeOrId === 'string' ? getSeoRoute(routeOrId) : routeOrId;
  const trail = [];
  const visited = new Set();
  let current = route;

  while (current) {
    if (visited.has(current.id)) {
      throw new Error(`Circular SEO route hierarchy at ${current.id}`);
    }
    visited.add(current.id);
    trail.unshift(current);
    current = current.parentId ? getSeoRoute(current.parentId) : null;
  }

  return trail;
}

export function getVisibleBreadcrumbs(routeOrId) {
  return getBreadcrumbTrail(routeOrId).slice(1).map((route, index, routes) => ({
    label: route.breadcrumbLabel,
    to: index < routes.length - 1 ? route.path : undefined,
  }));
}

function createBreadcrumbSchema(route) {
  const trail = getBreadcrumbTrail(route);
  if (trail.length < 2) {
    return null;
  }

  return {
    '@type': 'BreadcrumbList',
    '@id': `${canonicalUrl(route)}#breadcrumb`,
    itemListElement: trail.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.breadcrumbLabel,
      item: canonicalUrl(item),
    })),
  };
}

function createRegionalCoverageSchema(route) {
  const regionalPage = route.regionalPageId
    ? REGIONAL_PAGES.find((page) => page.id === route.regionalPageId)
    : null;
  if (!regionalPage) return null;

  return {
    '@type': regionalPage.regionSchemaType || 'Place',
    '@id': `${canonicalUrl(route)}#regional-coverage`,
    name: regionalPage.regionName,
    ...(regionalPage.regionAlternateName ? { alternateName: regionalPage.regionAlternateName } : {}),
  };
}

function createTrainingLocationSchema(route) {
  if (route.id !== 'lucknow-location') {
    return null;
  }

  return {
    '@type': 'Place',
    '@id': TRAINING_LOCATION_ID,
    url: canonicalUrl(route),
    name: BUSINESS_DATA.trainingLocation.name,
    address: {
      '@type': 'PostalAddress',
      ...BUSINESS_DATA.trainingLocation.address,
    },
    hasMap: BUSINESS_DATA.trainingLocation.mapUrl,
    containedInPlace: {
      '@type': 'City',
      name: BUSINESS_DATA.trainingLocation.address.addressLocality,
      containedInPlace: {
        '@type': 'AdministrativeArea',
        name: BUSINESS_DATA.trainingLocation.address.addressRegion,
      },
    },
  };
}

function createCareerGuideSchema(route) {
  const guide = route.careerGuideId ? getCareerGuide(route.careerGuideId) : null;
  if (!guide) return null;

  const canonical = canonicalUrl(route);
  return {
    '@type': 'Article',
    '@id': `${canonical}#article`,
    url: canonical,
    headline: guide.h1,
    description: guide.description,
    author: {
      '@type': 'Person',
      '@id': `${SITE_ORIGIN}/about/#${guide.author.id}`,
      name: guide.author.name,
      url: `${SITE_ORIGIN}${guide.author.profilePath}`,
      jobTitle: guide.author.role,
      worksFor: { '@id': ORGANIZATION_ID },
    },
    publisher: { '@id': ORGANIZATION_ID },
    datePublished: `${guide.publishedAt}T00:00:00Z`,
    dateModified: `${guide.updatedAt}T00:00:00Z`,
    mainEntityOfPage: { '@id': `${canonical}#webpage` },
    isPartOf: { '@id': WEBSITE_ID },
    inLanguage: BUSINESS_DATA.language,
    articleSection: CAREER_GUIDE_HUB.breadcrumbLabel,
  };
}

function createResourceSchema(route) {
  const resource = route.resourceId ? getResource(route.resourceId) : null;
  if (!resource) return null;

  const canonical = canonicalUrl(route);
  return {
    '@type': 'Article',
    '@id': `${canonical}#article`,
    url: canonical,
    headline: resource.h1,
    description: resource.description,
    author: resource.author.type === 'Organization'
      ? { '@id': ORGANIZATION_ID }
      : {
        '@type': 'Person',
        '@id': `${SITE_ORIGIN}/about/#${resource.author.id}`,
        name: resource.author.name,
        url: `${SITE_ORIGIN}${resource.author.profilePath}`,
        jobTitle: resource.author.role,
        worksFor: { '@id': ORGANIZATION_ID },
      },
    publisher: { '@id': ORGANIZATION_ID },
    datePublished: `${resource.publishedAt}T00:00:00Z`,
    dateModified: `${resource.updatedAt}T00:00:00Z`,
    mainEntityOfPage: { '@id': `${canonical}#webpage` },
    isPartOf: { '@id': WEBSITE_ID },
    inLanguage: BUSINESS_DATA.language,
    articleSection: RESOURCE_HUB.breadcrumbLabel,
  };
}

export function createCourseOffersSchema() {
  return LEARNING_MODES.map((mode) => ({
    '@type': 'Offer',
    name: mode.name,
    description: mode.description,
    price: mode.price.replace(/[^0-9]/g, ''),
    priceCurrency: 'INR',
    availability: 'https://schema.org/InStock',
    url: `${SITE_ORIGIN}/courses/`,
  }));
}

export function createCourseInstancesSchema() {
  return [
    {
      '@type': 'CourseInstance',
      name: 'Online Mode — Live Interactive Sessions Across India',
      courseMode: 'online',
      courseWorkload: 'P6W',
      inLanguage: BUSINESS_DATA.language,
    },
    {
      '@type': 'CourseInstance',
      name: 'Offline Mode — Classroom Sessions at Lucknow Partner Location',
      courseMode: 'onsite',
      courseWorkload: 'P6W',
      inLanguage: BUSINESS_DATA.language,
      location: {
        '@type': 'Place',
        name: BUSINESS_DATA.trainingLocation.name,
        address: {
          '@type': 'PostalAddress',
          ...BUSINESS_DATA.trainingLocation.address,
        },
      },
    },
  ];
}

function createLearningEntity(route) {
  const trackId = route.trackId || route.informationalModuleId;
  const track = trackId
    ? CAREER_TRACKS.find((candidate) => candidate.id === trackId)
    : null;

  if (!route.program && !track) {
    return null;
  }

  if (track) {
    return {
      '@type': 'LearningResource',
      '@id': `${canonicalUrl(route)}#learning-resource`,
      url: canonicalUrl(route),
      name: `${track.title} module`,
      description: `${track.description}. This is a module within the ${PROGRAM.name}.`,
      provider: { '@id': ORGANIZATION_ID },
      isPartOf: { '@id': PRIMARY_COURSE_ID },
      inLanguage: BUSINESS_DATA.language,
      teaches: track.description.split(', '),
    };
  }

  return {
    '@type': 'Course',
    '@id': PRIMARY_COURSE_ID,
    url: `${SITE_ORIGIN}/courses/`,
    name: PROGRAM.name,
    alternateName: PROGRAM.alternateName,
    description: PROGRAM.trainingDescription,
    provider: { '@id': ORGANIZATION_ID },
    inLanguage: BUSINESS_DATA.language,
    timeRequired: 'P6W',
    educationalCredentialAwarded: 'Course Completion Certificate',
    teaches: CAREER_TRACKS.flatMap((track) => [track.title, track.description]),
    offers: createCourseOffersSchema(),
    hasCourseInstance: createCourseInstancesSchema(),
  };
}

export function personSchemaId(person) {
  return `${SITE_ORIGIN}/about/#${person.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function routeImageUrl(route) {
  const image = route.image || DEFAULT_OG_IMAGE;
  return image.startsWith('http') ? image : `${SITE_ORIGIN}${image}`;
}

function routeImageType(route) {
  const image = route.image || DEFAULT_OG_IMAGE;
  if (image.endsWith('.png')) return 'image/png';
  if (image.endsWith('.webp')) return 'image/webp';
  if (image.endsWith('.avif')) return 'image/avif';
  return 'image/jpeg';
}

function createRouteImageSchema(route) {
  const canonical = canonicalUrl(route);
  const imageUrl = routeImageUrl(route);
  return {
    '@type': 'ImageObject',
    '@id': `${canonical}#primary-image`,
    url: imageUrl,
    contentUrl: imageUrl,
    caption: route.imageAlt || `${route.title} image`,
    ...(route.imageWidth ? { width: Number(route.imageWidth) } : {}),
    ...(route.imageHeight ? { height: Number(route.imageHeight) } : {}),
  };
}

function createPeopleSchema() {
  return LEADERSHIP.map((person) => ({
    '@type': 'Person',
    '@id': personSchemaId(person),
    name: person.name,
    jobTitle: person.role,
    worksFor: person.organization === BUSINESS_DATA.name
      ? { '@id': ORGANIZATION_ID }
      : { '@type': 'Organization', name: person.organization },
    description: person.experience,
    email: person.email,
  }));
}

function createFaqQuestions() {
  return GENERAL_FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  }));
}

export function createStructuredData(routeOrId) {
  const route = typeof routeOrId === 'string' ? getSeoRoute(routeOrId) : routeOrId;
  if (!route.indexable) {
    return null;
  }

  const canonical = canonicalUrl(route);
  const breadcrumb = createBreadcrumbSchema(route);
  const regionalCoverage = createRegionalCoverageSchema(route);
  const learningEntity = createLearningEntity(route);
  const trainingLocation = createTrainingLocationSchema(route);
  const careerGuide = createCareerGuideSchema(route);
  const resource = createResourceSchema(route);
  const routeImage = createRouteImageSchema(route);
  const webPage = {
    '@type': route.schemaType || 'WebPage',
    '@id': `${canonical}#webpage`,
    url: canonical,
    name: route.title,
    description: route.description,
    inLanguage: BUSINESS_DATA.language,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORGANIZATION_ID },
    primaryImageOfPage: { '@id': routeImage['@id'] },
    ...(regionalCoverage ? { spatialCoverage: { '@id': regionalCoverage['@id'] } } : {}),
    ...(breadcrumb ? { breadcrumb: { '@id': breadcrumb['@id'] } } : {}),
  };

  if (route.id === 'home' || route.id === 'contact') {
    webPage.mainEntity = { '@id': ORGANIZATION_ID };
  }

  if (trainingLocation) {
    webPage.mainEntity = { '@id': TRAINING_LOCATION_ID };
  }

  if (learningEntity) {
    webPage.mainEntity = { '@id': learningEntity['@id'] };
  }

  if (careerGuide) {
    webPage.mainEntity = { '@id': careerGuide['@id'] };
  }

  if (resource) {
    webPage.mainEntity = { '@id': resource['@id'] };
  }

  if (route.id === 'faqs') {
    webPage.mainEntity = createFaqQuestions();
  }

  if (route.id === 'about') {
    webPage.mainEntity = createPeopleSchema().map((person) => ({ '@id': person['@id'] }));
  }

  const graph = [createOrganizationSchema(), createWebsiteSchema(), webPage, routeImage];
  if (breadcrumb) graph.push(breadcrumb);
  if (regionalCoverage) graph.push(regionalCoverage);
  if (learningEntity) graph.push(learningEntity);
  if (trainingLocation) graph.push(trainingLocation);
  if (careerGuide) graph.push(careerGuide);
  if (resource) graph.push(resource);
  if (route.id === 'about') graph.push(...createPeopleSchema());

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}

export function createRouteMeta(id) {
  const route = getSeoRoute(id);
  const canonical = canonicalUrl(route);
  const robots = route.indexable ? 'index,follow' : 'noindex,follow';
  const structuredData = createStructuredData(route);
  const imageUrl = routeImageUrl(route);
  const imageType = routeImageType(route);
  const imageAlt = route.imageAlt || `${BUSINESS_DATA.name} logo`;
  const authoredContent = route.careerGuideId
    ? getCareerGuide(route.careerGuideId)
    : route.resourceId
      ? getResource(route.resourceId)
      : null;

  return [
    { title: route.title },
    { name: 'description', content: route.description },
    { name: 'robots', content: robots },
    { tagName: 'link', rel: 'canonical', href: canonical },
    { property: 'og:type', content: route.careerGuideId || route.resourceId ? 'article' : 'website' },
    { property: 'og:locale', content: BUSINESS_DATA.locale },
    { property: 'og:site_name', content: BUSINESS_DATA.name },
    { property: 'og:title', content: route.title },
    { property: 'og:description', content: route.description },
    { property: 'og:url', content: canonical },
    { property: 'og:image', content: imageUrl },
    ...(imageUrl.startsWith('https://') ? [{ property: 'og:image:secure_url', content: imageUrl }] : []),
    { property: 'og:image:type', content: imageType },
    ...(route.imageWidth ? [{ property: 'og:image:width', content: String(route.imageWidth) }] : route.image ? [] : [{ property: 'og:image:width', content: DEFAULT_OG_IMAGE_WIDTH }]),
    ...(route.imageHeight ? [{ property: 'og:image:height', content: String(route.imageHeight) }] : route.image ? [] : [{ property: 'og:image:height', content: DEFAULT_OG_IMAGE_HEIGHT }]),
    { property: 'og:image:alt', content: imageAlt },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: route.title },
    { name: 'twitter:description', content: route.description },
    { name: 'twitter:url', content: canonical },
    { name: 'twitter:image', content: imageUrl },
    { name: 'twitter:image:alt', content: imageAlt },
    ...(authoredContent ? [
      { name: 'author', content: authoredContent.author.name },
      { property: 'article:author', content: authoredContent.author.profilePath ? `${SITE_ORIGIN}${authoredContent.author.profilePath}` : authoredContent.author.name },
      { property: 'article:published_time', content: `${authoredContent.publishedAt}T00:00:00Z` },
      { property: 'article:modified_time', content: `${authoredContent.updatedAt}T00:00:00Z` },
      { property: 'article:section', content: route.parentId ? getSeoRoute(route.parentId).breadcrumbLabel : route.breadcrumbLabel },
    ] : []),
    ...(structuredData ? [{ 'script:ld+json': structuredData }] : []),
  ];
}
