#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { AUTHORITY_PATHS, AUTHORITY_TARGETS, LINKABLE_AUTHORITY_ASSETS, getAuthorityTarget } from '../src/content/seo/authorityBuilding.js';
import backlinkProspects from '../src/content/seo/backlinkProspects.json' with { type: 'json' };
import { INDEXABLE_ROUTES } from '../src/seo/seoRoutes.js';
import { INTERNAL_LINK_ARCHITECTURE } from '../src/seo/internalLinks.js';

const routeById = new Map(INDEXABLE_ROUTES.map((route) => [route.id, route]));
const inbound = new Map(INDEXABLE_ROUTES.map((route) => [route.id, []]));
for (const source of INDEXABLE_ROUTES) {
  for (const targetId of INTERNAL_LINK_ARCHITECTURE[source.id] || []) {
    if (inbound.has(targetId)) inbound.get(targetId).push(source.id);
  }
}

function routeLabel(routeId) {
  return routeById.get(routeId)?.h1 || routeId;
}

function routePath(routeId) {
  return routeById.get(routeId)?.path || 'unknown';
}

function tableRow(values) {
  return `| ${values.join(' | ')} |`;
}

const lines = [
  '# SEO Authority Report',
  '',
  `Generated: ${new Date().toISOString().slice(0, 10)}`,
  '',
  'This report describes the repository-controlled internal-link graph and the evidence-only external authority plan. It does not estimate rankings, traffic, domain authority, or earned backlinks.',
  '',
  '## Summary',
  '',
  `- Indexable routes: ${INDEXABLE_ROUTES.length}`,
  `- Registered internal graph edges: ${INDEXABLE_ROUTES.reduce((total, route) => total + (INTERNAL_LINK_ARCHITECTURE[route.id] || []).length, 0)}`,
  `- Priority destinations: ${AUTHORITY_TARGETS.length}`,
  `- Tested authority journeys: ${AUTHORITY_PATHS.length}`,
  `- External prospects: ${backlinkProspects.length} (all repository records, not earned links)`,
  '',
  '## Priority destinations',
  '',
  tableRow(['Route', 'URL', 'Tier', 'Inbound', 'Outbound', 'Purpose']),
  tableRow(['---', '---', '---', '---', '---', '---']),
];

for (const target of AUTHORITY_TARGETS) {
  const route = routeById.get(target.routeId);
  lines.push(tableRow([
    target.routeId,
    route?.path || 'unknown',
    target.tier,
    inbound.get(target.routeId)?.length || 0,
    INTERNAL_LINK_ARCHITECTURE[target.routeId]?.length || 0,
    target.purpose,
  ]));
}

lines.push('', '## Complete indexable graph', '', tableRow(['Route', 'URL', 'Authority tier', 'Inbound route IDs', 'Outbound route IDs']), tableRow(['---', '---', '---', '---', '---']));
for (const route of INDEXABLE_ROUTES) {
  const authority = getAuthorityTarget(route.id);
  lines.push(tableRow([
    route.id,
    route.path,
    authority?.tier || 'supporting',
    inbound.get(route.id)?.join(', ') || 'none',
    (INTERNAL_LINK_ARCHITECTURE[route.id] || []).join(', ') || 'none',
  ]));
}

lines.push('', '## Tested journeys', '');
for (const journey of AUTHORITY_PATHS) lines.push(`- **${journey.id}:** ${journey.routeIds.map((routeId) => `${routeLabel(routeId)} (${routePath(routeId)})`).join(' → ')}`);

lines.push('', '## Editorial authority assets', '', tableRow(['Asset', 'Status', 'Target URL', 'Format', 'Audience', 'Reader outcome', 'Editorial value']), tableRow(['---', '---', '---', '---', '---', '---', '---']));
for (const asset of LINKABLE_AUTHORITY_ASSETS) lines.push(tableRow([asset.id, asset.status, asset.targetPath, asset.format, asset.audience, asset.readerOutcome, asset.editorialValue]));

lines.push('', '## External prospect register', '', tableRow(['Prospect', 'Status', 'Asset', 'Target URL', 'Source evidence']), tableRow(['---', '---', '---', '---', '---']));
for (const prospect of backlinkProspects) lines.push(tableRow([prospect.id, prospect.status, prospect.assetId, prospect.targetPath, prospect.sourceUrl || 'not recorded']));

lines.push('', 'A genuine backlink is recorded only after a relevant independent publisher places it and the public HTTPS source is manually checked.');

const outputPath = path.resolve('SEO_AUTHORITY_REPORT.md');
fs.writeFileSync(outputPath, `${lines.join('\n')}\n`, 'utf8');
console.log(`SEO authority report written: ${outputPath}`);
