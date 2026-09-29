#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {
  SITE_ARCHITECTURE_CONTRACT,
  SITE_ARCHITECTURE_DISCOVERY_ROOTS,
  SITE_ARCHITECTURE_SCHEMA_VERSION,
  getSiteArchitectureReachability,
} from '../src/content/seo/siteArchitecture.js';
import { INTERNAL_LINK_ARCHITECTURE } from '../src/seo/internalLinks.js';

const outputPath = path.resolve('docs/seo-site-architecture.json');
const reachability = getSiteArchitectureReachability();
const report = {
  schemaVersion: SITE_ARCHITECTURE_SCHEMA_VERSION,
  sourceOfTruth: [
    'src/content/seo/siteArchitecture.js',
    'src/seo/internalLinks.js',
    'src/seo/seoRoutes.js',
  ],
  summary: {
    indexableNodeCount: SITE_ARCHITECTURE_CONTRACT.nodes.length,
    hubCount: SITE_ARCHITECTURE_CONTRACT.hubs.length,
    requiredHubEdgeCount: SITE_ARCHITECTURE_CONTRACT.hubs.reduce((total, hub) => total + hub.requiredTargetIds.length, 0),
    reciprocalGroupCount: SITE_ARCHITECTURE_CONTRACT.reciprocalGroups.length,
    authorityTargetCount: SITE_ARCHITECTURE_CONTRACT.authorityTargets.length,
    authorityJourneyCount: SITE_ARCHITECTURE_CONTRACT.authorityJourneys.length,
    keywordDestinationCount: SITE_ARCHITECTURE_CONTRACT.keywordDestinations.length,
    discoveryRootCount: SITE_ARCHITECTURE_DISCOVERY_ROOTS.length,
    discoveryReachableNodeCount: reachability.reachableRouteIds.length,
    discoveryUnreachableNodeCount: reachability.unreachableRouteIds.length,
    discoveryReachableKeywordDestinationCount: reachability.reachableKeywordDestinations.length,
    discoveryUnreachableKeywordDestinationCount: reachability.unreachableKeywordDestinations.length,
  },
  discoveryRoots: reachability.roots,
  discoveryReachability: reachability,
  hubs: SITE_ARCHITECTURE_CONTRACT.hubs,
  nodes: SITE_ARCHITECTURE_CONTRACT.nodes,
  reciprocalGroups: SITE_ARCHITECTURE_CONTRACT.reciprocalGroups,
  authorityTargets: SITE_ARCHITECTURE_CONTRACT.authorityTargets,
  authorityJourneys: SITE_ARCHITECTURE_CONTRACT.authorityJourneys,
  keywordDestinations: SITE_ARCHITECTURE_CONTRACT.keywordDestinations,
  registeredContextualEdges: Object.fromEntries(
    Object.entries(INTERNAL_LINK_ARCHITECTURE).map(([sourceId, targetIds]) => [sourceId, targetIds]),
  ),
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Site architecture report generated: ${path.relative(process.cwd(), outputPath)}`);
