export const SITE_ORIGIN = 'https://centaurcareers.in';

export const DEFAULT_OG_IMAGE =
  'https://horizons-cdn.hostinger.com/cffb4313-a439-4b6d-a0e2-eb0a66a950b9/743152148dd3f6734568a106bb709d06.jpg';

const LAST_MEANINGFUL_UPDATE = '2026-08-26';

export const SEO_ROUTES = Object.freeze([
  {
    id: 'home',
    path: '/',
    title: 'Banking & Finance Career Training in Lucknow | Centaur Careers',
    description:
      'Build job-ready banking and finance skills through live training from Centaur Careers in Lucknow, with online learning and structured career support.',
    h1: 'Job-Oriented Banking & Finance Training in Lucknow',
    indexable: true,
    lastModified: LAST_MEANINGFUL_UPDATE,
  },
  {
    id: 'courses',
    path: '/courses/',
    title: 'Banking & Finance Courses with Career Support | Centaur Careers',
    description:
      'Compare practical courses in investment banking operations, retail banking and finance operations, including curriculum, eligibility and learning modes.',
    h1: 'Banking & Finance Career Courses',
    indexable: true,
    lastModified: LAST_MEANINGFUL_UPDATE,
  },
  {
    id: 'investment-banking-operations',
    path: '/courses/investment-banking-operations/',
    title: 'Investment Banking Operations Course | Centaur Careers',
    description:
      'Learn trade settlements, reconciliations, corporate actions and fund accounting through a practical investment banking operations course.',
    h1: 'Investment Banking Operations Course',
    indexable: true,
    lastModified: LAST_MEANINGFUL_UPDATE,
  },
  {
    id: 'retail-banking',
    path: '/courses/retail-banking/',
    title: 'Retail Banking Course with Career Support | Centaur Careers',
    description:
      'Prepare for branch operations, customer service, relationship management and loan-processing work through practical retail banking training.',
    h1: 'Retail Banking Course',
    indexable: true,
    lastModified: LAST_MEANINGFUL_UPDATE,
  },
  {
    id: 'finance-operations',
    path: '/courses/finance-operations/',
    title: 'Finance Operations Course | Centaur Careers',
    description:
      'Build practical skills in loan operations, credit documentation, risk controls, payments and NBFC workflows through live finance operations training.',
    h1: 'Finance Operations Course',
    indexable: true,
    lastModified: LAST_MEANINGFUL_UPDATE,
  },
  {
    id: 'placements',
    path: '/placements/',
    title: 'Placement Support for Finance Careers | Centaur Careers',
    description:
      'Understand the Centaur Careers placement-support process, student eligibility, interview preparation and standards for publishing verified outcomes.',
    h1: 'Placement Support and Eligibility',
    indexable: true,
    lastModified: LAST_MEANINGFUL_UPDATE,
  },
  {
    id: 'about',
    path: '/about/',
    title: 'About Centaur Careers | Banking & Finance Training',
    description:
      'Learn about Centaur Careers, its practical training approach and its focus on helping learners build job-ready banking and finance skills.',
    h1: 'About Centaur Careers',
    indexable: true,
    lastModified: LAST_MEANINGFUL_UPDATE,
  },
  {
    id: 'contact',
    path: '/contact/',
    title: 'Contact Centaur Careers in Lucknow',
    description:
      'Contact Centaur Careers in Alambagh, Lucknow for course details, admissions support, current batch schedules and training-centre directions.',
    h1: 'Contact Centaur Careers',
    indexable: true,
    lastModified: LAST_MEANINGFUL_UPDATE,
  },
  {
    id: 'not-found',
    path: '/404/',
    title: 'Page Not Found | Centaur Careers',
    description:
      'The requested page could not be found. Return to Centaur Careers or explore our banking and finance career courses.',
    h1: 'Page Not Found',
    indexable: false,
  },
]);

function validateSeoRoutes(routes) {
  const ids = new Set();
  const paths = new Set();
  const titles = new Set();
  const canonicals = new Set();

  for (const route of routes) {
    if (!route.id || !route.path || !route.title || !route.description || !route.h1) {
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
      [canonicals, canonical, 'canonical'],
    ];

    for (const [values, value, label] of duplicateChecks) {
      if (values.has(value)) {
        throw new Error(`Duplicate SEO route ${label}: ${value}`);
      }
      values.add(value);
    }
  }
}

validateSeoRoutes(SEO_ROUTES);

export const INDEXABLE_ROUTES = Object.freeze(
  SEO_ROUTES.filter((route) => route.indexable),
);

// React Router's prerenderer treats a trailing slash as a redirect request for
// routes declared without a trailing slash. Build from the route pathname while
// retaining trailing slashes in the public SEO contract and canonical URLs.
export const PRERENDER_PATHS = Object.freeze(
  SEO_ROUTES.map((route) => (route.path === "/" ? "/" : route.path.slice(0, -1))),
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

export function createRouteMeta(id) {
  const route = getSeoRoute(id);
  const canonical = canonicalUrl(route);
  const robots = route.indexable ? 'index,follow' : 'noindex,follow';

  return [
    { title: route.title },
    { name: 'description', content: route.description },
    { name: 'robots', content: robots },
    { tagName: 'link', rel: 'canonical', href: canonical },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'Centaur Careers' },
    { property: 'og:title', content: route.title },
    { property: 'og:description', content: route.description },
    { property: 'og:url', content: canonical },
    { property: '