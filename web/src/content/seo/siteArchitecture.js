import { AUTHORITY_PATHS, AUTHORITY_TARGETS } from './authorityBuilding.js';
import { KEYWORD_PAGE_ARCHITECTURE } from './keywordStrategy.js';
import { INTERNAL_LINK_ARCHITECTURE } from '../../seo/internalLinks.js';
import { INDEXABLE_ROUTES } from '../../seo/seoRoutes.js';

export const SITE_ARCHITECTURE_SCHEMA_VERSION = 1;

// These roots represent the site's main discovery paths. A page can have an
// inbound link and still be effectively buried if no primary hub can reach it.
export const SITE_ARCHITECTURE_DISCOVERY_ROOTS = Object.freeze([
  'home',
  'courses',
  'career-guides',
  'resources',
  'india',
]);

const COURSE_MODULE_ROUTE_IDS = Object.freeze(
  INDEXABLE_ROUTES
    .filter((route) => route.parentId === 'courses')
    .map((route) => route.id),
);

const CAREER_GUIDE_ROUTE_IDS = Object.freeze(
  INDEXABLE_ROUTES
    .filter((route) => route.careerGuideId)
    .map((route) => route.id),
);

const RESOURCE_ROUTE_IDS = Object.freeze(
  INDEXABLE_ROUTES
    .filter((route) => route.resourceId)
    .map((route) => route.id),
);

const REGIONAL_ROUTE_IDS = Object.freeze(
  INDEXABLE_ROUTES
    .filter((route) => route.regional)
    .map((route) => route.id),
);

const LEGAL_ROUTE_IDS = Object.freeze([
  'privacy-policy',
  'terms-and-conditions',
  'cookie-policy',
  'refund-cancellation-policy',
  'disclaimer',
].filter((routeId) => INDEXABLE_ROUTES.some((route) => route.id === routeId)));

const MODULE_GUIDE_PAIRS = Object.freeze([
  ['investment-banking-operations', 'career-guide-investment-banking-operations'],
  ['retail-banking', 'career-guide-retail-banking-operations'],
  ['finance-operations', 'career-guide-finance-operations'],
  ['kyc-aml-compliance', 'career-guide-kyc-aml-analyst'],
  ['digital-payments', 'career-guide-digital-payments-operations'],
  ['fintech-neo-banking', 'career-guide-fintech-operations'],
].map(([moduleRouteId, guideRouteId]) => Object.freeze({ moduleRouteId, guideRouteId })));

// These are the page families that must remain discoverable from a useful hub.
// The actual links are rendered by InternalLinkGroup from INTERNAL_LINK_ARCHITECTURE;
// this file declares the minimum connected graph that the build must satisfy.
export const SITE_ARCHITECTURE_HUBS = Object.freeze([
  Object.freeze({
    routeId: 'home',
    role: 'discovery-hub',
    requiredTargetIds: Object.freeze(['courses', 'career-guides', 'resources', 'india', 'placements', 'blog', 'faqs', 'contact']),
  }),
  Object.freeze({
    routeId: 'blog',
    role: 'editorial-hub',
    requiredTargetIds: Object.freeze(['career-guides', 'resources', 'india', 'courses', 'placements', 'faqs', 'contact']),
  }),
  Object.freeze({
    routeId: 'career-guides',
    role: 'career-information-hub',
    requiredTargetIds: Object.freeze(['courses', 'resources', 'india', 'placements', 'faqs', 'contact', ...CAREER_GUIDE_ROUTE_IDS]),
  }),
  Object.freeze({
    routeId: 'resources',
    role: 'learning-resource-hub',
    requiredTargetIds: Object.freeze(['courses', 'career-guides', 'india', 'quiz', 'placements', 'faqs', 'contact', ...RESOURCE_ROUTE_IDS]),
  }),
  Object.freeze({
    routeId: 'quiz',
    role: 'learning-assessment-hub',
    requiredTargetIds: Object.freeze(['resources', 'courses', 'career-guides', 'india', 'placements', 'contact']),
  }),
  Object.freeze({
    routeId: 'courses',
    role: 'commercial-hub',
    requiredTargetIds: Object.freeze([
      ...COURSE_MODULE_ROUTE_IDS,
      'career-guides',
      'career-guide-choosing-finance-career-course',
      'career-guide-finance-careers-after-graduation',
      'career-guide-investment-banking-operations',
      'career-guide-retail-banking-operations',
      'career-guide-finance-operations',
      'career-guide-kyc-aml-analyst',
      'career-guide-digital-payments-operations',
      'career-guide-fintech-operations',
      'comparison-investment-banking-operations',
      'placements',
      'india',
      'resources',
      'faqs',
      'contact',
    ]),
  }),
  Object.freeze({
    routeId: 'placements',
    role: 'commercial-support-hub',
    requiredTargetIds: Object.freeze(['student-outcomes', 'courses', 'career-guides', 'resources', 'india', 'faqs', 'contact']),
  }),
  Object.freeze({
    routeId: 'student-outcomes',
    role: 'learner-outcomes-collection',
    requiredTargetIds: Object.freeze(['placements', 'courses', 'about', 'contact']),
  }),
  Object.freeze({
    routeId: 'india',
    role: 'national-discovery-hub',
    requiredTargetIds: Object.freeze([
      'courses',
      'career-guides',
      'resources',
      'placements',
      'faqs',
      'lucknow-location',
      'contact',
      ...COURSE_MODULE_ROUTE_IDS,
      ...REGIONAL_ROUTE_IDS,
    ]),
  }),
  Object.freeze({
    routeId: 'lucknow-location',
    role: 'local-commercial-hub',
    requiredTargetIds: Object.freeze(['contact', 'courses', 'career-guides', 'resources', 'india', 'placements', 'faqs']),
  }),
  Object.freeze({
    routeId: 'contact',
    role: 'conversion-hub',
    requiredTargetIds: Object.freeze(['lucknow-location', 'courses', 'career-guides', 'resources', 'india', 'placements', 'faqs']),
  }),
  Object.freeze({
    routeId: 'faqs',
    role: 'decision-support-hub',
    requiredTargetIds: Object.freeze(['courses', 'career-guides', 'resources', 'india', 'placements', 'lucknow-location', 'contact']),
  }),
]);

export const SITE_ARCHITECTURE_RECIPROCAL_GROUPS = Object.freeze([
  Object.freeze({
    id: 'course-module-parent-paths',
    pairs: Object.freeze(COURSE_MODULE_ROUTE_IDS.map((routeId) => Object.freeze({ sourceId: 'courses', targetId: routeId }))),
    reciprocal: true,
  }),
  Object.freeze({
    id: 'career-guide-parent-paths',
    pairs: Object.freeze(CAREER_GUIDE_ROUTE_IDS.map((routeId) => Object.freeze({ sourceId: 'career-guides', targetId: routeId }))),
    reciprocal: true,
  }),
  Object.freeze({
    id: 'resource-parent-paths',
    pairs: Object.freeze(RESOURCE_ROUTE_IDS.map((routeId) => Object.freeze({ sourceId: 'resources', targetId: routeId }))),
    reciprocal: true,
  }),
  Object.freeze({
    id: 'regional-parent-paths',
    pairs: Object.freeze(REGIONAL_ROUTE_IDS.map((routeId) => Object.freeze({ sourceId: 'india', targetId: routeId }))),
    reciprocal: true,
  }),
  Object.freeze({
    id: 'legal-policy-cross-navigation',
    pairs: Object.freeze(LEGAL_ROUTE_IDS
      .filter((routeId) => routeId !== 'privacy-policy')
      .map((routeId) => Object.freeze({ sourceId: 'privacy-policy', targetId: routeId }))),
    reciprocal: true,
  }),
  Object.freeze({
    id: 'module-career-topic-paths',
    pairs: Object.freeze(MODULE_GUIDE_PAIRS.flatMap(({ moduleRouteId, guideRouteId }) => [
      Object.freeze({ sourceId: moduleRouteId, targetId: guideRouteId }),
      Object.freeze({ sourceId: guideRouteId, targetId: moduleRouteId }),
    ])),
    reciprocal: false,
  }),
]);

const HUB_ROUTE_IDS = new Set(SITE_ARCHITECTURE_HUBS.map((hub) => hub.routeId));

function roleForRoute(route) {
  if (HUB_ROUTE_IDS.has(route.id)) return SITE_ARCHITECTURE_HUBS.find((hub) => hub.routeId === route.id).role;
  if (route.regional) return 'regional-guide';
  if (route.careerGuideId) return 'career-guide';
  if (route.resourceId) return 'learning-resource';
  if (route.informationalModuleId) return 'informational-module';
  if (route.trackId) return 'commercial-module';
  if (route.comparison) return 'comparison';
  if (route.id === 'about') return 'entity-page';
  if (LEGAL_ROUTE_IDS.includes(route.id)) return 'legal-page';
  return 'supporting-page';
}

export const SITE_ARCHITECTURE_NODES = Object.freeze(
  INDEXABLE_ROUTES.map((route) => Object.freeze({
    routeId: route.id,
    path: route.path,
    parentId: route.parentId || null,
    role: roleForRoute(route),
    keywordOwnerUrl: route.keywordOwnerUrl || null,
    indexable: route.indexable,
  })),
);

export const SITE_ARCHITECTURE_CONTRACT = Object.freeze({
  schemaVersion: SITE_ARCHITECTURE_SCHEMA_VERSION,
  routeCount: INDEXABLE_ROUTES.length,
  hubs: SITE_ARCHITECTURE_HUBS,
  nodes: SITE_ARCHITECTURE_NODES,
  reciprocalGroups: SITE_ARCHITECTURE_RECIPROCAL_GROUPS,
  authorityTargets: AUTHORITY_TARGETS,
  authorityJourneys: AUTHORITY_PATHS,
  keywordDestinations: KEYWORD_PAGE_ARCHITECTURE,
});

export function getSiteArchitectureNode(routeId) {
  return SITE_ARCHITECTURE_NODES.find((node) => node.routeId === routeId) || null;
}

export function getSiteArchitectureEdges() {
  return SITE_ARCHITECTURE_HUBS.flatMap((hub) => hub.requiredTargetIds.map((targetId) => ({
    sourceId: hub.routeId,
    targetId,
    kind: 'hub-to-spoke',
  })));
}

export function getSiteArchitectureReachability(startRouteIds = SITE_ARCHITECTURE_DISCOVERY_ROOTS) {
  const routeIds = new Set(INDEXABLE_ROUTES.map((route) => route.id));
  const reachableRouteIds = new Set(startRouteIds.filter((routeId) => routeIds.has(routeId)));
  const queue = [...reachableRouteIds];

  while (queue.length > 0) {
    const sourceId = queue.shift();
    for (const targetId of INTERNAL_LINK_ARCHITECTURE[sourceId] || []) {
      if (routeIds.has(targetId) && !reachableRouteIds.has(targetId)) {
        reachableRouteIds.add(targetId);
        queue.push(targetId);
      }
    }
  }

  const unreachableRouteIds = INDEXABLE_ROUTES
    .filter((route) => !reachableRouteIds.has(route.id))
    .map((route) => route.id);
  const reachableKeywordDestinations = KEYWORD_PAGE_ARCHITECTURE
    .filter((page) => {
      const route = INDEXABLE_ROUTES.find((candidate) => candidate.path === page.targetUrl);
      return route && reachableRouteIds.has(route.id);
    })
    .map((page) => page.targetUrl);
  const unreachableKeywordDestinations = KEYWORD_PAGE_ARCHITECTURE
    .filter((page) => !reachableKeywordDestinations.includes(page.targetUrl))
    .map((page) => page.targetUrl);

  return Object.freeze({
    roots: Object.freeze([...startRouteIds]),
    reachableRouteIds: Object.freeze([...reachableRouteIds]),
    unreachableRouteIds: Object.freeze(unreachableRouteIds),
    reachableKeywordDestinations: Object.freeze(reachableKeywordDestinations),
    unreachableKeywordDestinations: Object.freeze(unreachableKeywordDestinations),
  });
}

export function validateSiteArchitectureSource() {
  const failures = [];
  const routeIds = new Set(INDEXABLE_ROUTES.map((route) => route.id));
  const nodeIds = new Set(SITE_ARCHITECTURE_NODES.map((node) => node.routeId));

  if (SITE_ARCHITECTURE_NODES.length !== INDEXABLE_ROUTES.length) {
    failures.push(`architecture node count ${SITE_ARCHITECTURE_NODES.length} does not match indexable route count ${INDEXABLE_ROUTES.length}`);
  }

  for (const routeId of routeIds) {
    if (!nodeIds.has(routeId)) failures.push(`indexable route is missing an architecture node: ${routeId}`);
    if (!INTERNAL_LINK_ARCHITECTURE[routeId]?.length) failures.push(`indexable route is missing a contextual link registry entry: ${routeId}`);
  }

  for (const hub of SITE_ARCHITECTURE_HUBS) {
    if (!routeIds.has(hub.routeId)) failures.push(`architecture hub is not indexable: ${hub.routeId}`);
    for (const targetId of hub.requiredTargetIds) {
      if (!routeIds.has(targetId)) failures.push(`${hub.routeId} architecture contract targets a non-indexable route: ${targetId}`);
    }
  }

  for (const group of SITE_ARCHITECTURE_RECIPROCAL_GROUPS) {
    for (const pair of group.pairs) {
      if (!routeIds.has(pair.sourceId) || !routeIds.has(pair.targetId)) {
        failures.push(`${group.id} references a non-indexable route: ${pair.sourceId} -> ${pair.targetId}`);
      }
    }
  }

  for (const page of KEYWORD_PAGE_ARCHITECTURE) {
    const destination = INDEXABLE_ROUTES.find((route) => route.path === page.targetUrl);
    if (!destination) failures.push(`keyword architecture destination is not indexable: ${page.targetUrl}`);
  }

  const reachability = getSiteArchitectureReachability();
  for (const rootId of reachability.roots) {
    if (!routeIds.has(rootId)) failures.push(`discovery root is not an indexable route: ${rootId}`);
  }
  for (const routeId of reachability.unreachableRouteIds) {
    failures.push(`indexable route is not reachable from the main discovery hubs: ${routeId}`);
  }
  for (const targetUrl of reachability.unreachableKeywordDestinations) {
    failures.push(`keyword destination is not reachable from the main discovery hubs: ${targetUrl}`);
  }

  return failures;
}
