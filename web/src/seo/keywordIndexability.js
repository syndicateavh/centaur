import { PROPOSED_PAGE_READINESS } from '../content/contentGovernance.js';
import {
  KEYWORD_PAGE_ARCHITECTURE,
  KEYWORD_STRATEGY_CONFIG,
  KEYWORD_STRATEGY_ROWS,
  KEYWORD_STRATEGY_SOURCE,
  getKeywordOwnership,
} from './keywordMap.js';
import { getInternalLinks } from './internalLinks.js';
import { INDEXABLE_ROUTES, SEO_ROUTES, SITE_ORIGIN } from './seoRoutes.js';

export const KEYWORD_INDEXABILITY_SCHEMA_VERSION = 1;

export const KEYWORD_INDEXABILITY_SOURCE = Object.freeze({
  workbook: KEYWORD_STRATEGY_SOURCE.workbook,
  keywordSheet: KEYWORD_STRATEGY_SOURCE.keywordSheet,
  architectureSheet: KEYWORD_STRATEGY_SOURCE.architectureSheet,
  importedOn: KEYWORD_STRATEGY_SOURCE.importedOn,
  country: KEYWORD_STRATEGY_CONFIG.country,
  language: KEYWORD_STRATEGY_CONFIG.language,
});

const routeByPath = new Map(SEO_ROUTES.map((route) => [route.path, route]));
const routeById = new Map(SEO_ROUTES.map((route) => [route.id, route]));
const readinessByPath = new Map(PROPOSED_PAGE_READINESS.map((page) => [page.path, page]));

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((left, right) => left.localeCompare(right));
}

function canonicalUrl(pathname) {
  return `${SITE_ORIGIN}${pathname}`;
}

function getInboundLinksByPath() {
  const inboundLinks = new Map();

  for (const sourceRoute of INDEXABLE_ROUTES) {
    for (const link of getInternalLinks(sourceRoute.id)) {
      if (!routeByPath.has(link.to)) continue;
      if (!inboundLinks.has(link.to)) inboundLinks.set(link.to, []);
      inboundLinks.get(link.to).push({
        routeId: sourceRoute.id,
        path: sourceRoute.path,
        label: link.label,
      });
    }
  }

  for (const [targetPath, links] of inboundLinks.entries()) {
    const deduplicated = new Map(links.map((link) => [link.routeId, link]));
    inboundLinks.set(targetPath, [...deduplicated.values()].sort((left, right) => left.path.localeCompare(right.path)));
  }

  return inboundLinks;
}

function getConversionDestination(route) {
  const destinationId = route.program || route.trackId || route.informationalModuleId ? 'contact' : 'courses';
  const destinationRoute = routeById.get(destinationId);

  return {
    routeId: destinationRoute.id,
    path: destinationRoute.path,
    label: destinationRoute.h1,
    stage: destinationId === 'contact' ? 'conversion' : 'commercial-consideration',
    rationale: destinationId === 'contact'
      ? 'Course and module visitors need a direct enrolment or cohort enquiry path.'
      : 'Informational, regional, resource, and comparison visitors should be introduced to the commercial course hub.',
  };
}

function getRouteStatus(route, readiness) {
  if (route) return route.indexable ? 'indexable' : 'noindex';
  if (readiness) return `governed-${readiness.status}`;
  return 'unmapped-destination';
}

function getAuditFields(route, audit) {
  const canonical = route ? canonicalUrl(route.path) : null;
  const audited = audit?.available === true;
  const prerendered = audited ? audit.prerenderedByPath.get(route?.path) === true : null;
  const renderedCanonical = audited ? audit.renderedCanonicalByPath.get(route?.path) || null : null;

  return {
    sitemapIncluded: audited && canonical ? audit.sitemapUrls.has(canonical) : null,
    prerendered,
    renderedCanonical,
    canonicalMatches: audited && canonical ? renderedCanonical === canonical : null,
  };
}

function createTargetRecord(page, inboundLinksByPath, audit) {
  const ownership = getKeywordOwnership(page.targetUrl);
  const route = routeByPath.get(page.targetUrl) || null;
  const readiness = readinessByPath.get(page.targetUrl) || null;
  const rows = KEYWORD_STRATEGY_ROWS.filter((row) => row.targetUrl === page.targetUrl);
  const outboundLinks = route ? getInternalLinks(route.id) : [];
  const inboundLinks = inboundLinksByPath.get(page.targetUrl) || [];
  const auditFields = getAuditFields(route, audit);
  const status = getRouteStatus(route, readiness);
  const destination = route ? getConversionDestination(route) : null;

  return {
    targetUrl: page.targetUrl,
    canonicalUrl: route ? canonicalUrl(route.path) : null,
    routeId: route?.id || null,
    page: {
      title: route?.title || null,
      description: route?.description || null,
      h1: route?.h1 || null,
      purpose: page.primaryPurpose,
      type: page.pageType,
      action: ownership?.pageAction || null,
    },
    ownership: {
      primaryKeyword: ownership?.primaryKeyword || null,
      secondaryKeywords: ownership?.secondaryKeywords || [],
      keywordIds: rows.map((row) => row.id).sort((left, right) => left - right),
      keywordCount: rows.length,
      topPriority: ownership?.topPriority ?? null,
      clusters: ownership?.clusters || [],
      intents: ownership?.intents || [],
      funnelStages: uniqueSorted(rows.map((row) => row.funnel)),
      waves: ownership?.waves || [],
    },
    evidence: {
      sourceWorkbook: KEYWORD_INDEXABILITY_SOURCE.workbook,
      importedOn: KEYWORD_INDEXABILITY_SOURCE.importedOn,
      evidenceUrls: uniqueSorted(rows.map((row) => row.evidenceUrl)),
      lastModified: route?.lastModified || null,
      governanceStatus: readiness?.status || (route?.indexable ? 'published' : status),
    },
    indexability: {
      status,
      routeRegistered: Boolean(route),
      indexable: route?.indexable === true,
      robots: route?.indexable === true ? 'index,follow' : 'noindex,follow',
      sitemapEligible: route?.indexable === true,
      ...auditFields,
    },
    internalLinks: {
      inbound: inboundLinks,
      outbound: outboundLinks.map((link) => ({
        routeId: link.routeId,
        path: link.to,
        label: link.label,
        authorityTier: link.authorityTier,
      })),
      inboundCount: inboundLinks.length,
      outboundCount: outboundLinks.length,
      orphan: route?.indexable === true && inboundLinks.length === 0,
    },
    conversionDestination: destination,
  };
}

function createKeywordRecord(row, targetByUrl) {
  const target = targetByUrl.get(row.targetUrl);

  return {
    id: row.id,
    keyword: row.keyword,
    normalizedKeyword: row.normalizedKeyword,
    owner: {
      targetUrl: row.targetUrl,
      routeId: target?.routeId || null,
      canonicalUrl: target?.canonicalUrl || null,
    },
    search: {
      cluster: row.cluster,
      intent: row.intent,
      funnel: row.funnel,
      priority: row.priority,
      wave: row.wave,
    },
    content: {
      pageType: row.pageType,
      pageAction: row.pageAction,
      pageTheme: row.pageTheme,
      competitors: row.competitors,
    },
    evidence: {
      url: row.evidenceUrl,
      notes: row.notes,
    },
    indexability: target
      ? {
          status: target.indexability.status,
          indexable: target.indexability.indexable,
          sitemapIncluded: target.indexability.sitemapIncluded,
          prerendered: target.indexability.prerendered,
          canonicalMatches: target.indexability.canonicalMatches,
        }
      : {
          status: 'unmapped-destination',
          indexable: false,
          sitemapIncluded: false,
          prerendered: false,
          canonicalMatches: false,
        },
  };
}

export function createKeywordIndexabilityMap(audit = null) {
  const inboundLinksByPath = getInboundLinksByPath();
  const targets = KEYWORD_PAGE_ARCHITECTURE.map((page) => createTargetRecord(page, inboundLinksByPath, audit));
  const targetByUrl = new Map(targets.map((target) => [target.targetUrl, target]));
  const keywords = KEYWORD_STRATEGY_ROWS.map((row) => createKeywordRecord(row, targetByUrl));
  const indexableTargets = targets.filter((target) => target.indexability.indexable);
  const auditedTargets = targets.filter((target) => target.indexability.sitemapIncluded !== null);

  return {
    schemaVersion: KEYWORD_INDEXABILITY_SCHEMA_VERSION,
    source: KEYWORD_INDEXABILITY_SOURCE,
    summary: {
      keywordCount: keywords.length,
      targetCount: targets.length,
      indexableTargetCount: indexableTargets.length,
      indexableKeywordCount: keywords.filter((keyword) => keyword.indexability.indexable).length,
      sitemapIncludedTargetCount: targets.filter((target) => target.indexability.sitemapIncluded === true).length,
      prerenderedTargetCount: targets.filter((target) => target.indexability.prerendered === true).length,
      audited: auditedTargets.length === targets.length,
      orphanTargets: targets.filter((target) => target.internalLinks.orphan).map((target) => target.targetUrl),
      governedTargets: targets.filter((target) => !target.indexability.indexable).map((target) => target.targetUrl),
    },
    targets,
    keywords,
  };
}

export const KEYWORD_INDEXABILITY_MAP = createKeywordIndexabilityMap();

export function getKeywordIndexability(targetUrl) {
  return KEYWORD_INDEXABILITY_MAP.targets.find((target) => target.targetUrl === targetUrl) || null;
}
