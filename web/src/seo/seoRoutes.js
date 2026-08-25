import { BUSINESS_DATA, ORGANIZATION_ID, WEBSITE_ID } from '../content/businessData.js';
import { COURSE_DATA } from '../content/courseData.js';
import { GENERAL_FAQS } from '../content/faqData.js';
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_HEIGHT,
  DEFAULT_OG_IMAGE_WIDTH,
  SITE_ORIGIN,
} from './siteConfig.js';

export { DEFAULT_OG_IMAGE, SITE_ORIGIN } from './siteConfig.js';

const LAST_MEANINGFUL_UPDATE = '2026-08-26';

export const SEO_ROUTES = Object.freeze([
  {
    id: 'home',
    path: '/',
    title: 'Banking & Finance Career Training in Lucknow | Centaur Careers',
    description:
      'Build job-ready banking and finance skills through live training from Centaur Careers in Lucknow, with online learning and structured career support.',
    h1: 'Job-Oriented Banking & Finance Training in Lucknow',
    breadcrumbLabel: 'Home',
    schemaType: 'WebPage',
    indexable: true,
    lastModified: LAST_MEANINGFUL_UPDATE,
  },
  {
    id: 'courses',
    parentId: 'home',
    path: '/courses/',
    title: 'Banking & Finance Courses with Career Support | Centaur Careers',
    description:
      'Compare practical courses in investment banking operations, retail banking and finance operations, including curriculum, eligibility and learning modes.',
    h1: 'Banking & Finance Career Courses',
    breadcrumbLabel: 'Courses',
    schemaType: 'CollectionPage',
    indexable: true,
    lastModified: LAST_MEANINGFUL_UPDATE,
  },
  {
    id: 'investment-banking-operations',
    parentId: 'courses',
    path: '/courses/investment-banking-operations/',
    title: 'Investment Banking Operations Course | Centaur Careers',
    description:
      'Learn trade settlements, reconciliations, corporate actions and fund accounting through a practical investment banking operations course.',
    h1: 'Investment Banking Operations Course',
    breadcrumbLabel: 'Investment Banking Operations',
    schemaType: 'WebPage',
    courseId: 'investment-banking-operations',
    indexable: true,
    lastModified: LAST_MEANINGFUL_UPDATE,
  },
  {
    id: 'retail-banking',
    parentId: 'courses',
    path: '/courses/retail-banking/',
    title: 'Retail Banking Course with Career Support | Centaur Careers',
    description:
      'Prepare for branch operations, customer service, relationship management and loan-processing work through practical retail banking training.',
    h1: 'Retail Banking Course',
    breadcrumbLabel: 'Retail Banking',
    schemaType: 'WebPage',
    courseId: 'retail-banking',
    indexable: true,
    lastModified: LAST_MEANINGFUL_UPDATE,
  },
  {
    id: 'finance-operations',
    parentId: 'courses',
    path: '/courses/finance-operations/',
    title: 'Finance Operations Course | Centaur Careers',
    description:
      'Build practical skills in loan operations, credit documentation, risk controls, payments and NBFC workflows through live finance operations training.',
    h1: 'Finance Operations Course',
    breadcrumbLabel: 'Finance Operations',
    schemaType: 'WebPage',
    courseId: 'finance-operations',
    indexable: true,
    lastModified: LAST_MEANINGFUL_UPDATE,
  },
  {
    id: 'placements',
    parentId: 'home',
    path: '/placements/',
    title: 'Placement Support for Finance Careers | Centaur Careers',
    description:
      'Understand the Centaur Careers placement-support process, student eligibility, interview preparation and standards for publishing verified outcomes.',
    h1: 'Placement Support and Eligibility',
    breadcrumbLabel: 'Placement Support',
    schemaType: 'WebPage',
    indexable: true,
    lastModified: LAST_MEANINGFUL_UPDATE,
  },
  {
    id: 'about',
    parentId: 'home',
    path: '/about/',
    title: 'About Centaur Careers | Banking & Finance Training',
    description:
      'Learn about Centaur Careers, its practical training approach and its focus on helping learners build job-ready banking and finance skills.',
    h1: 'About Centaur Careers',
    breadcrumbLabel: 'About',
    schemaType: 'AboutPage',
    indexable: true,
    lastModified: LAST_MEANINGFUL_UPDATE,
  },
  {
    id: 'contact',
    parentId: 'home',
    path: '/contact/',
    title: 'Contact Centaur Careers in Lucknow',
    description:
      'Contact Centaur Careers in Alambagh, Lucknow for course details, admissions support, current batch schedules and training-centre directions.',
    h1: 'Contact Centaur Careers',
    breadcrumbLabel: 'Contact',
    schemaType: 'ContactPage',
    indexable: true,
    lastModified: LAST_MEANINGFUL_UPDATE,
  },
  {
    id: 'lucknow-location',
    parentId: 'home',
    path: '/locations/lucknow/',
    title: 'Banking & Finance Training Centre in Lucknow | Centaur Careers',
    description:
      'Find the Centaur Careers banking and finance training centre in Alambagh, Lucknow, with address, directions, learning options and visit guidance.',
    h1: 'Banking & Finance Training Centre in Lucknow',
    breadcrumbLabel: 'Lucknow Training Centre',
    schemaType: 'WebPage',
    indexable: true,
    lastModified: LAST_MEANINGFUL_UPDATE,
  },
  {
    id: 'faqs',
    parentId: 'home',
    path: '/faqs/',
    title: 'Banking & Finance Course FAQs | Centaur Careers',
    description:
      'Read clear answers about Centaur Careers courses, eligibility, Lucknow and online learning, schedules, fees and responsible career support.',
    h1: 'Banking and Finance Course FAQs',
    breadcrumbLabel: 'FAQs',
    schemaType: 'FAQPage',
    indexable: true,
    lastModified: LAST_MEANINGFUL_UPDATE,
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

function createOrganizationSchema() {
  return {
    '@type': ['EducationalOrganization', 'LocalBusiness'],
    '@id': ORGANIZATION_ID,
    name: BUSINESS_DATA.name,
    description: BUSINESS_DATA.description,
    url: BUSINESS_DATA.url,
    logo: {
      '@type': 'ImageObject',
      '@id': `${SITE_ORIGIN}/#logo`,
      url: BUSINESS_DATA.logoUrl,
      contentUrl: BUSINESS_DATA.logoUrl,
      width: Number(DEFAULT_OG_IMAGE_WIDTH),
      height: Number(DEFAULT_OG_IMAGE_HEIGHT),
      caption: BUSINESS_DATA.name,
    },
    image: { '@id': `${SITE_ORIGIN}/#logo` },
    telephone: BUSINESS_DATA.telephone,
    email: BUSINESS_DATA.email,
    address: {
      '@type': 'PostalAddress',
      ...BUSINESS_DATA.address,
    },
    areaServed: [
      { '@type': 'City', name: 'Lucknow' },
      { '@type': 'Country', name: 'India' },
    ],
    sameAs: [...BUSINESS_DATA.sameAs],
  };
}

function createWebsiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE_ORIGIN}/`,
    name: BUSINESS_DATA.name,
    inLanguage: 'en-IN',
    publisher: { '@id': ORGANIZATION_ID },
  };
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

function createCourseSchema(route) {
  if (!route.courseId) {
    return null;
  }

  const course = COURSE_DATA[route.courseId];
  if (!course) {
    throw new Error(`Missing course data for structured data route: ${route.id}`);
  }

  return {
    '@type': 'Course',
    '@id': `${canonicalUrl(route)}#course`,
    url: canonicalUrl(route),
    name: route.h1,
    description: route.description,
    provider: { '@id': ORGANIZATION_ID },
    inLanguage: 'en-IN',
    educationalLevel: 'Graduate, final-year student and early-career learner',
    teaches: course.outcomes,
  };
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
  const course = createCourseSchema(route);
  const webPage = {
    '@type': route.schemaType || 'WebPage',
    '@id': `${canonical}#webpage`,
    url: canonical,
    name: route.title,
    description: route.description,
    inLanguage: 'en-IN',
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORGANIZATION_ID },
    ...(breadcrumb ? { breadcrumb: { '@id': breadcrumb['@id'] } } : {}),
  };

  if (route.id === 'home' || route.id === 'contact' || route.id === 'lucknow-location') {
    webPage.mainEntity = { '@id': ORGANIZATION_ID };
  }

  if (course) {
    webPage.mainEntity = { '@id': course['@id'] };
  }

  if (route.id === 'faqs') {
    webPage.mainEntity = createFaqQuestions();
  }

  const graph = [createOrganizationSchema(), createWebsiteSchema(), webPage];
  if (breadcrumb) graph.push(breadcrumb);
  if (course) graph.push(course);

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

  return [
    { title: route.title },
    { name: 'description', content: route.description },
    { name: 'robots', content: robots },
    { tagName: 'link', rel: 'canonical', href: canonical },
    { property: 'og:type', content: 'website' },
    { property: 'og:locale', content: 'en_IN' },
    { property: 'og:site_name', content: BUSINESS_DATA.name },
    { property: 'og:title', content: route.title },
    { property: 'og:description', content: route.description },
    { property: 'og:url', content: canonical },
    { property: 'og:image', content: DEFAULT_OG_IMAGE },
    { property: 'og:image:type', content: 'image/jpeg' },
    { property: 'og:image:width', content: DEFAULT_OG_IMAGE_WIDTH },
    { property: 'og:image:height', content: DEFAULT_OG_IMAGE_HEIGHT },
    { property: 'og:image:alt', content: `${BUSINESS_DATA.name} logo` },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: route.title },
    { name: 'twitter:description', content: route.description },
    { name: 'twitter:image', content: DEFAULT_OG_IMAGE },
    { name: 'twitter:image:alt', content: `${BUSINESS_DATA.name} logo` },
    ...(structuredData ? [{ 'script:ld+json': structuredData }] : []),
  ];
}
