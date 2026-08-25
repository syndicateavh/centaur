import { BUSINESS_DATA, ORGANIZATION_ID, WEBSITE_ID } from '../content/businessData.js';
import { GENERAL_FAQS } from '../content/faqData.js';
import { CAREER_TRACKS, LEADERSHIP, PROGRAM } from '../content/sourceContent.js';
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
    title: 'Finance Career Training Lucknow | Centaur Careers | Investment Banking, Retail Banking & NBFC Jobs | Alambagh & Krishna Nagar',
    description: PROGRAM.metaDescription,
    h1: PROGRAM.headline,
    breadcrumbLabel: 'Home',
    schemaType: 'WebPage',
    indexable: true,
    lastModified: LAST_MEANINGFUL_UPDATE,
  },
  {
    id: 'courses',
    parentId: 'home',
    path: '/courses/',
    title: 'Financial Operations Masterclass | Centaur Careers',
    description: PROGRAM.trainingDescription,
    h1: PROGRAM.name,
    breadcrumbLabel: 'Financial Operations Masterclass',
    schemaType: 'CollectionPage',
    program: true,
    indexable: true,
    lastModified: LAST_MEANINGFUL_UPDATE,
  },
  {
    id: 'investment-banking-operations',
    parentId: 'courses',
    path: '/courses/investment-banking-operations/',
    title: 'Investment Banking Operations Career Track | Centaur Careers',
    description: 'Trade Settlements, Reconciliation, Corporate Actions, Fund Accounting. Target CTC ₹6–12 LPA.',
    h1: 'Investment Banking Ops',
    breadcrumbLabel: 'Investment Banking Operations',
    schemaType: 'WebPage',
    trackId: 'investment-banking-operations',
    indexable: true,
    lastModified: LAST_MEANINGFUL_UPDATE,
  },
  {
    id: 'retail-banking',
    parentId: 'courses',
    path: '/courses/retail-banking/',
    title: 'Retail Banking Career Track | Centaur Careers',
    description: 'Relationship Manager, Branch Ops, Loan Officer, NRI Banking. Target CTC ₹3–6 LPA.',
    h1: 'Retail Banking',
    breadcrumbLabel: 'Retail Banking',
    schemaType: 'WebPage',
    trackId: 'retail-banking',
    indexable: true,
    lastModified: LAST_MEANINGFUL_UPDATE,
  },
  {
    id: 'finance-operations',
    parentId: 'courses',
    path: '/courses/finance-operations/',
    title: 'Finance Operations Career Track | Centaur Careers',
    description: 'NBFC, Loan Processing, Credit Analysis, Risk Management. Target CTC ₹3–6 LPA.',
    h1: 'Finance Operations',
    breadcrumbLabel: 'Finance Operations',
    schemaType: 'WebPage',
    trackId: 'finance-operations',
    indexable: true,
    lastModified: LAST_MEANINGFUL_UPDATE,
  },
  {
    id: 'placements',
    parentId: 'home',
    path: '/placements/',
    title: 'Placement Guarantee & Student Promise | Centaur Careers',
    description: "Every student who meets program criteria is supported until they secure the right role, or we return their fee in full.",
    h1: 'Placement Guarantee & Student Promise',
    breadcrumbLabel: 'Placement Guarantee',
    schemaType: 'WebPage',
    indexable: true,
    lastModified: LAST_MEANINGFUL_UPDATE,
  },
  {
    id: 'about',
    parentId: 'home',
    path: '/about/',
    title: 'About Centaur Careers | Banking & Finance Training',
    description: 'Founded by banking veterans with 15+ years of industry experience, Centaur Careers has placed 100+ graduates across Investment Banking, Retail Banking, NBFCs, and FinTech.',
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
    description: 'Fill out the enrollment form and the Centaur Careers team will reach out within 24 hours. Phone, email, WhatsApp and Lucknow address.',
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
    title: 'Mindsprout Careers Hub Lucknow | Centaur Careers',
    description: 'In-person sessions at Mindsprout Careers Hub, R K Tower, 70/2, Sector B, Badabirwa, Alambagh, Lucknow, Uttar Pradesh 226005.',
    h1: 'Mindsprout Careers Hub, Lucknow',
    breadcrumbLabel: 'Mindsprout Careers Hub',
    schemaType: 'WebPage',
    indexable: true,
    lastModified: LAST_MEANINGFUL_UPDATE,
  },
  {
    id: 'faqs',
    parentId: 'home',
    path: '/faqs/',
    title: 'Finance Career Program FAQs | Centaur Careers',
    description: 'Answers about program eligibility, the placement guarantee, online and offline modes, interview opportunities, placement cities and post-placement support.',
    h1: 'Finance Career Program FAQs',
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
  if (!route.program) {
    return null;
  }

  return {
    '@type': 'Course',
    '@id': `${canonicalUrl(route)}#course`,
    url: canonicalUrl(route),
    name: PROGRAM.name,
    alternateName: PROGRAM.alternateName,
    description: PROGRAM.trainingDescription,
    provider: { '@id': ORGANIZATION_ID },
    inLanguage: 'en-IN',
    timeRequired: 'P6W',
    teaches: CAREER_TRACKS.flatMap((track) => [track.title, track.description]),
  };
}

function createPeopleSchema() {
  return LEADERSHIP.map((person) => ({
    '@type': 'Person',
    '@id': `${SITE_ORIGIN}/about/#${person.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
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

  if (route.id === 'about') {
    webPage.mainEntity = createPeopleSchema().map((person) => ({ '@id': person['@id'] }));
  }

  const graph = [createOrganizationSchema(), createWebsiteSchema(), webPage];
  if (breadcrumb) graph.push(breadcrumb);
  if (course) graph.push(course);
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
