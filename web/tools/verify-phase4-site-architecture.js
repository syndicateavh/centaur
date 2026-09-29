#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { AUTHORITY_PATHS, AUTHORITY_TARGETS } from '../src/content/seo/authorityBuilding.js';
import { KEYWORD_PAGE_ARCHITECTURE } from '../src/content/seo/keywordStrategy.js';
import {
  SITE_ARCHITECTURE_HUBS,
  SITE_ARCHITECTURE_NODES,
  SITE_ARCHITECTURE_RECIPROCAL_GROUPS,
  getSiteArchitectureReachability,
  validateSiteArchitectureSource,
} from '../src/content/seo/siteArchitecture.js';
import { INDEXABLE_ROUTES, SEO_ROUTES } from '../src/seo/seoRoutes.js';
import { INTERNAL_LINK_ARCHITECTURE } from '../src/seo/internalLinks.js';

const buildRoot = path.resolve('build/client');
const failures = [...validateSiteArchitectureSource()];
const indexableRoutesById = new Map(INDEXABLE_ROUTES.map((route) => [route.id, route]));
const routesByPath = new Map(SEO_ROUTES.map((route) => [route.path, route]));
const htmlCache = new Map();

function fail(message) {
  failures.push(message);
}

function outputFileForRoute(route) {
  return route.path === '/'
    ? path.join(buildRoot, 'index.html')
    : path.join(buildRoot, route.path.slice(1), 'index.html');
}

function decodeHtml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#x27;', "'")
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function routeHtml(routeId) {
  if (htmlCache.has(routeId)) return htmlCache.get(routeId);

  const route = indexableRoutesById.get(routeId);
  if (!route) {
    fail(`architecture references an unknown indexable route: ${routeId}`);
    return '';
  }

  const outputFile = outputFileForRoute(route);
  if (!fs.existsSync(outputFile)) {
    fail(`${route.path}: prerendered page is missing for the Phase 4 architecture audit`);
    return '';
  }

  const html = fs.readFileSync(outputFile, 'utf8');
  htmlCache.set(routeId, html);
  return html;
}

function relatedGroup(html) {
  return html.match(/<nav\b(?=[^>]*\baria-label="Related pages")(?=[^>]*\bdata-internal-link-group(?:="[^"]*")?)[^>]*>([\s\S]*?)<\/nav>/i)?.[1] || '';
}

function contextualAnchors(routeId) {
  return [...relatedGroup(routeHtml(routeId)).matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map((match) => ({
    targetId: match[1].match(/\bdata-internal-link-target="([^"]+)"/i)?.[1] || '',
    href: decodeHtml(match[1].match(/\bhref="([^"]+)"/i)?.[1] || ''),
  }));
}

function hasRegisteredEdge(sourceId, targetId) {
  return INTERNAL_LINK_ARCHITECTURE[sourceId]?.includes(targetId) || false;
}

function hasRenderedEdge(sourceId, targetId) {
  const target = indexableRoutesById.get(targetId);
  if (!target) return false;
  return contextualAnchors(sourceId).some((anchor) => anchor.targetId === targetId && anchor.href === target.path);
}

function checkNodeCoverage() {
  const indexableIds = new Set(INDEXABLE_ROUTES.map((route) => route.id));
  const nodeIds = new Set();

  for (const node of SITE_ARCHITECTURE_NODES) {
    if (nodeIds.has(node.routeId)) fail(`duplicate architecture node: ${node.routeId}`);
    nodeIds.add(node.routeId);

    const route = indexableRoutesById.get(node.routeId);
    if (!route) {
      fail(`architecture node is not an indexable route: ${node.routeId}`);
      continue;
    }
    if (route.path !== node.path) fail(`${node.routeId}: architecture path does not match SEO route metadata`);
    if (!node.role) fail(`${node.routeId}: architecture node is missing a page role`);
  }

  for (const route of INDEXABLE_ROUTES) {
    if (!nodeIds.has(route.id)) fail(`${route.path}: indexable route is missing from the architecture node map`);
  }

  for (const [sourceId, targetIds] of Object.entries(INTERNAL_LINK_ARCHITECTURE)) {
    if (!indexableIds.has(sourceId)) fail(`contextual link registry contains an unknown source route: ${sourceId}`);
    if (new Set(targetIds).size !== targetIds.length) fail(`${sourceId}: contextual architecture contains duplicate targets`);

    for (const targetId of targetIds) {
      if (!indexableIds.has(targetId)) fail(`${sourceId}: contextual architecture targets a non-indexable route: ${targetId}`);
      if (sourceId === targetId) fail(`${sourceId}: contextual architecture points to itself`);
    }
  }

  const inbound = new Map(INDEXABLE_ROUTES.map((route) => [route.id, new Set()]));
  for (const [sourceId, targetIds] of Object.entries(INTERNAL_LINK_ARCHITECTURE)) {
    for (const targetId of targetIds) inbound.get(targetId)?.add(sourceId);
  }
  for (const route of INDEXABLE_ROUTES) {
    if (route.id !== 'home' && !inbound.get(route.id)?.size) {
      fail(`${route.path}: architecture graph leaves an indexable route without contextual inbound coverage`);
    }
  }
}

function checkRequiredEdge(sourceId, targetId, label) {
  if (!indexableRoutesById.has(sourceId) || !indexableRoutesById.has(targetId)) {
    fail(`${label}: source or target is not an indexable route (${sourceId} -> ${targetId})`);
    return;
  }
  if (!hasRegisteredEdge(sourceId, targetId)) {
    fail(`${label}: registered contextual edge is missing (${sourceId} -> ${targetId})`);
    return;
  }
  if (!hasRenderedEdge(sourceId, targetId)) {
    fail(`${label}: rendered contextual edge is missing or non-canonical (${sourceId} -> ${targetId})`);
  }
}

function checkHubContracts() {
  for (const hub of SITE_ARCHITECTURE_HUBS) {
    const requiredTargetIds = new Set(hub.requiredTargetIds);
    if (requiredTargetIds.size !== hub.requiredTargetIds.length) fail(`${hub.routeId}: hub contract contains duplicate target IDs`);

    for (const targetId of hub.requiredTargetIds) {
      checkRequiredEdge(hub.routeId, targetId, `${hub.role} hub contract`);
    }
  }
}

function checkReciprocalGroups() {
  for (const group of SITE_ARCHITECTURE_RECIPROCAL_GROUPS) {
    for (const pair of group.pairs) {
      checkRequiredEdge(pair.sourceId, pair.targetId, `${group.id} path`);
      if (group.reciprocal) checkRequiredEdge(pair.targetId, pair.sourceId, `${group.id} reciprocal path`);
    }
  }
}

function checkAuthorityTargets() {
  for (const target of AUTHORITY_TARGETS) {
    const route = indexableRoutesById.get(target.routeId);
    if (!route) {
      fail(`authority target is not an indexable architecture node: ${target.routeId}`);
      continue;
    }

    const inboundSources = INDEXABLE_ROUTES.filter((source) => hasRegisteredEdge(source.id, target.routeId));
    if (inboundSources.length < target.minimumInbound) {
      fail(`${target.routeId}: authority target has ${inboundSources.length} inbound routes; minimum is ${target.minimumInbound}`);
    }

    for (const sourceId of target.requiredInboundRouteIds) {
      checkRequiredEdge(sourceId, target.routeId, `${target.routeId} authority inbound`);
    }
  }
}

function checkAuthorityJourneys() {
  for (const journey of AUTHORITY_PATHS) {
    for (let index = 0; index < journey.routeIds.length - 1; index += 1) {
      checkRequiredEdge(journey.routeIds[index], journey.routeIds[index + 1], `${journey.id} journey`);
    }
  }
}

function checkKeywordDestinations() {
  for (const destination of KEYWORD_PAGE_ARCHITECTURE) {
    const route = routesByPath.get(destination.targetUrl);
    if (!route?.indexable) {
      fail(`keyword destination is not an indexable architecture node: ${destination.targetUrl}`);
      continue;
    }

    const inbound = INDEXABLE_ROUTES.filter((source) => hasRegisteredEdge(source.id, route.id));
    if (!inbound.length) fail(`${destination.targetUrl}: keyword owner has no contextual inbound architecture edge`);
  }
}

function checkDiscoveryReachability() {
  const reachability = getSiteArchitectureReachability();
  for (const routeId of reachability.unreachableRouteIds) {
    fail(`${routeId}: indexable route is not reachable from the main discovery hubs`);
  }
  for (const targetUrl of reachability.unreachableKeywordDestinations) {
    fail(`${targetUrl}: keyword destination is not reachable from the main discovery hubs`);
  }
}

checkNodeCoverage();
checkHubContracts();
checkReciprocalGroups();
checkAuthorityTargets();
checkAuthorityJourneys();
checkKeywordDestinations();
checkDiscoveryReachability();

if (failures.length > 0) {
  console.error(`Phase 4 site-architecture verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

const requiredEdgeCount = SITE_ARCHITECTURE_HUBS.reduce((total, hub) => total + hub.requiredTargetIds.length, 0);
console.log(`Phase 4 site architecture verified: ${INDEXABLE_ROUTES.length} indexable nodes, ${SITE_ARCHITECTURE_HUBS.length} connected hubs, ${requiredEdgeCount} required hub edges, ${SITE_ARCHITECTURE_RECIPROCAL_GROUPS.length} reciprocal groups, ${AUTHORITY_PATHS.length} authority journeys, and ${KEYWORD_PAGE_ARCHITECTURE.length} keyword destinations rendered.`);
