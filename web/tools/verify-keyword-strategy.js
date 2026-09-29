#!/usr/bin/env node

import { PROPOSED_PAGE_READINESS } from '../src/content/contentGovernance.js';
import {
  KEYWORD_OWNERSHIP,
  KEYWORD_PAGE_ARCHITECTURE,
  KEYWORD_STRATEGY_ROWS,
  KEYWORD_STRATEGY_SOURCE,
} from '../src/seo/keywordMap.js';
import { INDEXABLE_ROUTES, SEO_ROUTES } from '../src/seo/seoRoutes.js';

const failures = [];
const routeByPath = new Map(SEO_ROUTES.map((route) => [route.path, route]));
const readinessByPath = new Map(PROPOSED_PAGE_READINESS.map((page) => [page.path, page]));
const rowsByTarget = new Map();
const rowsByKeyword = new Map();

function fail(message) {
  failures.push(message);
}

for (const row of KEYWORD_STRATEGY_ROWS) {
  if (!rowsByTarget.has(row.targetUrl)) rowsByTarget.set(row.targetUrl, []);
  rowsByTarget.get(row.targetUrl).push(row);
  if (rowsByKeyword.has(row.normalizedKeyword)) {
    fail(`duplicate normalized keyword ownership: ${row.keyword}`);
  } else {
    rowsByKeyword.set(row.normalizedKeyword, row);
  }

  for (const field of ['keyword', 'normalizedKeyword', 'cluster', 'intent', 'funnel', 'targetUrl', 'pageType', 'pageAction', 'wave']) {
    if (!row[field]) fail(`keyword row ${row.id} is missing ${field}`);
  }
  if (!Number.isInteger(row.id) || row.id < 1 || row.id > KEYWORD_STRATEGY_SOURCE.keywordCount) fail(`keyword row has invalid ID: ${row.id}`);
  if (!Number.isInteger(row.priority) || row.priority < 0 || row.priority > 100) fail(`${row.keyword}: priority must be an integer from 0 to 100`);
}

if (KEYWORD_STRATEGY_SOURCE.keywordCount !== 728) fail(`strategy source must contain 728 keywords, found ${KEYWORD_STRATEGY_SOURCE.keywordCount}`);
if (KEYWORD_STRATEGY_ROWS.length !== KEYWORD_STRATEGY_SOURCE.keywordCount) fail('strategy source count does not match imported row count');
if (KEYWORD_PAGE_ARCHITECTURE.length !== KEYWORD_STRATEGY_SOURCE.targetUrlCount) fail('strategy target URL count does not match content architecture count');
if (new Set(KEYWORD_STRATEGY_ROWS.map((row) => row.id)).size !== KEYWORD_STRATEGY_ROWS.length) fail('keyword row IDs are duplicated');

const architecturePaths = new Set();
let architectureTotal = 0;
for (const page of KEYWORD_PAGE_ARCHITECTURE) {
  if (architecturePaths.has(page.targetUrl)) fail(`duplicate content architecture target: ${page.targetUrl}`);
  architecturePaths.add(page.targetUrl);
  architectureTotal += page.mappedKeywordCount;
  const actualCount = rowsByTarget.get(page.targetUrl)?.length || 0;
  if (actualCount !== page.mappedKeywordCount) fail(`${page.targetUrl}: architecture expects ${page.mappedKeywordCount} keywords, imported ${actualCount}`);
  if (!KEYWORD_OWNERSHIP[page.targetUrl]) fail(`${page.targetUrl}: keyword ownership record is missing`);
  if (!routeByPath.has(page.targetUrl) && !readinessByPath.has(page.targetUrl)) fail(`${page.targetUrl}: no route or governed proposed-page record exists`);
}
if (architectureTotal !== KEYWORD_STRATEGY_ROWS.length) fail(`content architecture totals ${architectureTotal} keywords, expected ${KEYWORD_STRATEGY_ROWS.length}`);
if (new Set(Object.keys(KEYWORD_OWNERSHIP)).size !== KEYWORD_PAGE_ARCHITECTURE.length) fail('keyword ownership target count does not match content architecture');

const primaryKeywords = new Set();
for (const [targetUrl, ownership] of Object.entries(KEYWORD_OWNERSHIP)) {
  const actualRows = rowsByTarget.get(targetUrl) || [];
  if (ownership.keywordCount !== actualRows.length) fail(`${targetUrl}: ownership count does not match keyword rows`);
  if (!ownership.primaryKeyword || !ownership.secondaryKeywords) fail(`${targetUrl}: ownership must define one primary and secondary keywords`);
  if (primaryKeywords.has(ownership.primaryKeywordNormalized)) fail(`primary keyword is owned by more than one URL: ${ownership.primaryKeyword}`);
  primaryKeywords.add(ownership.primaryKeywordNormalized);
  if (!actualRows.some((row) => row.normalizedKeyword === ownership.primaryKeywordNormalized)) {
    fail(`${targetUrl}: primary keyword is not present in its mapped keyword rows`);
  }
}

for (const route of INDEXABLE_ROUTES) {
  if (!route.keywordPurpose || !route.primaryKeyword) fail(`${route.path}: indexable route needs a keyword purpose and primary keyword`);
  if (route.keywordOwnerUrl && !KEYWORD_OWNERSHIP[route.keywordOwnerUrl]) fail(`${route.path}: keywordOwnerUrl is not an imported strategy target`);
  if (route.keywordOwnerUrl && route.primaryKeyword !== KEYWORD_OWNERSHIP[route.keywordOwnerUrl].primaryKeyword) {
    fail(`${route.path}: primary keyword does not match its declared keyword owner`);
  }
}

for (const targetUrl of KEYWORD_PAGE_ARCHITECTURE.map((page) => page.targetUrl)) {
  const route = routeByPath.get(targetUrl);
  const readiness = readinessByPath.get(targetUrl);
  if (route?.indexable !== true && !readiness) fail(`${targetUrl}: target is not indexable and has no governed readiness record`);
  if (readiness && readiness.mappedKeywords !== rowsByTarget.get(targetUrl)?.length) fail(`${targetUrl}: content governance count does not match imported strategy`);
}

if (failures.length > 0) {
  console.error(`Keyword strategy verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

const publishedTargets = KEYWORD_PAGE_ARCHITECTURE.filter((page) => routeByPath.get(page.targetUrl)?.indexable).length;
const gatedTargets = KEYWORD_PAGE_ARCHITECTURE.length - publishedTargets;
console.log(`Keyword strategy verified: ${KEYWORD_STRATEGY_ROWS.length} unique keywords, ${KEYWORD_PAGE_ARCHITECTURE.length} canonical targets, ${publishedTargets} published owners, and ${gatedTargets} governed future destinations.`);
