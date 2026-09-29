#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { APPROVED_CONTENT_SOURCE } from '../src/content/verifiedClaims.js';
import {
  CONTENT_FACTS,
  CONTENT_REVIEW_STATUSES,
  CURRENT_ROUTE_CONTENT_INVENTORY,
  DO_NOT_BUILD_RULES,
  PROPOSED_PAGE_READINESS,
  PROTECTED_CONTENT_FILES,
} from '../src/content/contentGovernance.js';
import { SEO_ROUTES } from '../src/seo/seoRoutes.js';

const failures = [];
const manifestPath = path.resolve('docs/content-protection-manifest.json');
const manifest = fs.existsSync(manifestPath)
  ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  : null;

function fail(message) {
  failures.push(message);
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function verifyHash(file, expected, label) {
  const resolved = path.resolve(file);
  if (!fs.existsSync(resolved)) {
    fail(`${label}: missing ${file}`);
    return;
  }
  const actual = sha256(resolved);
  if (actual !== expected) fail(`${label}: hash changed for ${file}; use the approval workflow before changing protected content`);
}

if (!manifest) {
  fail('content baseline manifest is missing: docs/content-protection-manifest.json');
} else {
  if (manifest.schemaVersion !== 1) fail('content baseline manifest has an unsupported schema version');
  if (manifest.approvalRequired !== true) fail('content baseline manifest must require explicit approval');
  if (manifest.approvedOriginalSource?.path !== APPROVED_CONTENT_SOURCE.file) fail('content baseline source path does not match APPROVED_CONTENT_SOURCE');
  verifyHash(manifest.approvedOriginalSource.path, manifest.approvedOriginalSource.sha256, 'approved original source');

  const baselineFiles = new Map((manifest.protectedFiles || []).map((file) => [file.path, file.sha256]));
  for (const file of PROTECTED_CONTENT_FILES) {
    if (!baselineFiles.has(file)) fail(`content baseline manifest does not protect ${file}`);
    else verifyHash(file, baselineFiles.get(file), 'protected content');
  }
  for (const file of baselineFiles.keys()) {
    if (!PROTECTED_CONTENT_FILES.includes(file)) fail(`content baseline manifest contains an unregistered protected file: ${file}`);
  }
}

for (const fact of CONTENT_FACTS) {
  if (!fact.id || !fact.subject || !fact.value) fail('content fact registry contains an incomplete fact');
  if (!CONTENT_REVIEW_STATUSES.includes(fact.sourceStatus)) fail(`${fact.id}: invalid source status ${fact.sourceStatus}`);
  if (!CONTENT_REVIEW_STATUSES.includes(fact.verificationStatus)) fail(`${fact.id}: invalid verification status ${fact.verificationStatus}`);
  if (!Array.isArray(fact.evidence) || fact.evidence.length === 0) fail(`${fact.id}: evidence references are required`);
  if (!Array.isArray(fact.routes) || fact.routes.length === 0) fail(`${fact.id}: route scope is required`);
  if (fact.verificationStatus !== 'repository-verified' && !fact.requiredEvidence && fact.verificationStatus !== 'approved-original') {
    fail(`${fact.id}: unresolved facts must state the evidence required for approval`);
  }
  if (!fact.allowedUse) fail(`${fact.id}: allowed-use rule is required`);
}

const inventoryPaths = new Set(CURRENT_ROUTE_CONTENT_INVENTORY.map((route) => route.path));
const registeredPaths = new Set(SEO_ROUTES.map((route) => route.path));
if (CURRENT_ROUTE_CONTENT_INVENTORY.length !== registeredPaths.size - 1) {
  fail(`current route content inventory must cover all public routes except /404/; found ${CURRENT_ROUTE_CONTENT_INVENTORY.length} entries for ${registeredPaths.size - 1} routes`);
}
for (const route of SEO_ROUTES.filter((route) => route.path !== '/404/')) {
  if (!inventoryPaths.has(route.path)) fail(`current route content inventory is missing ${route.path}`);
}
for (const route of CURRENT_ROUTE_CONTENT_INVENTORY) {
  if (!registeredPaths.has(route.path)) fail(`current route content inventory contains an unregistered route: ${route.path}`);
  if (!CONTENT_REVIEW_STATUSES.includes(route.status)) fail(`${route.path}: invalid route review status ${route.status}`);
  if (!route.source || !route.purpose || !route.additions) fail(`${route.path}: purpose, source, and additions policy are required`);
}

const readinessPaths = new Set();
for (const page of PROPOSED_PAGE_READINESS) {
  if (readinessPaths.has(page.path)) fail(`proposed page readiness contains a duplicate path: ${page.path}`);
  readinessPaths.add(page.path);
  if (!/^\//.test(page.path) || !page.path.endsWith('/')) fail(`${page.path}: proposed SEO paths must be permanent trailing-slash paths`);
  if (!Number.isInteger(page.mappedKeywords) || page.mappedKeywords < 1) fail(`${page.path}: mapped keyword count is invalid`);
  if (!Number.isInteger(page.topPriority) || page.topPriority < 0 || page.topPriority > 100) fail(`${page.path}: priority is invalid`);
  if (!CONTENT_REVIEW_STATUSES.includes(page.status)) fail(`${page.path}: invalid readiness status ${page.status}`);
  if (!Array.isArray(page.requirements) || page.requirements.length === 0) fail(`${page.path}: implementation requirements are missing`);
  if (page.status === 'ready-to-build' && page.currentRoute !== true) fail(`${page.path}: ready-to-build pages must already have a registered route`);
  if (page.currentRoute === true && !registeredPaths.has(page.path)) fail(`${page.path}: current route flag is incorrect`);
}
if (PROPOSED_PAGE_READINESS.length !== 24) fail(`proposed page readiness should contain the workbook's 24 consolidated target URLs, found ${PROPOSED_PAGE_READINESS.length}`);
if (DO_NOT_BUILD_RULES.length < 4) fail('do-not-build safeguards are incomplete');

if (failures.length > 0) {
  console.error(`Content governance verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

const unresolvedFacts = CONTENT_FACTS.filter((fact) => !['repository-verified', 'approved-original'].includes(fact.verificationStatus)).length;
const pendingPages = PROPOSED_PAGE_READINESS.filter((page) => page.status !== 'ready-to-build').length;
console.log(`Content governance verified: ${PROTECTED_CONTENT_FILES.length} protected files, ${CONTENT_FACTS.length} registered facts (${unresolvedFacts} requiring review), ${CURRENT_ROUTE_CONTENT_INVENTORY.length} current routes, and ${PROPOSED_PAGE_READINESS.length} proposed destinations (${pendingPages} gated).`);
