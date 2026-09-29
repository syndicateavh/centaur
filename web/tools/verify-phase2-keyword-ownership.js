#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { KEYWORD_PAGE_ARCHITECTURE, KEYWORD_STRATEGY_ROWS } from '../src/seo/keywordMap.js';
import { INDEXABLE_ROUTES, SEO_ROUTES } from '../src/seo/seoRoutes.js';

const failures = [];
const generatedOn = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Calcutta' }).format(new Date());

const checks = [
  ['keyword strategy ownership', 'tools/verify-keyword-strategy.js'],
  ['regional and online keyword ownership', 'tools/verify-regional-keyword-ownership.js'],
  ['keyword indexability map', 'tools/verify-keyword-indexability.js'],
  ['route and blog page ownership', 'tools/verify-page-keywords.js'],
  ['search intent owner decisions', 'tools/verify-search-intent-ownership.js'],
  ['blog keyword queue', 'tools/verify-blog-keyword-queue.js'],
  ['keyword research architecture', 'tools/verify-keyword-research.js'],
];

function fail(message) {
  failures.push(message);
}

function readJson(relativePath) {
  const filePath = path.resolve(relativePath);
  if (!fs.existsSync(filePath)) {
    fail(`missing generated ownership artifact: ${relativePath}`);
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    fail(`${relativePath} is not valid JSON: ${error.message}`);
    return null;
  }
}

for (const [label, relativeScript] of checks) {
  console.log(`\n[seo:phase2:check] ${label}`);
  const result = spawnSync(process.execPath, [path.resolve(relativeScript)], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
  });
  if (result.error) {
    fail(`${label} could not run: ${result.error.message}`);
  } else if (result.status !== 0) {
    fail(`${label} failed with exit code ${result.status ?? 'unknown'}`);
  }
}

const report = readJson('docs/seo-keyword-report.json');
const briefs = readJson('docs/seo-keyword-content-briefs.json');
const indexabilityMap = readJson('docs/seo-keyword-indexability-map.json');

if (report) {
  if (report.generatedOn !== generatedOn) fail(`keyword report is stale: expected generatedOn ${generatedOn}, found ${report.generatedOn}`);
  if (report.keywords?.length !== KEYWORD_STRATEGY_ROWS.length) fail('keyword report row count does not match the imported strategy');
  if (report.keywordOwners?.length !== KEYWORD_PAGE_ARCHITECTURE.length) fail('keyword report owner count does not match content architecture');
  if (report.pages?.length !== SEO_ROUTES.length) fail('keyword report page audit does not match the route registry');
  if (report.summary?.numberOfIndexablePages !== INDEXABLE_ROUTES.length) fail('keyword report indexable-page count is stale');
  if (report.summary?.totalKeywordsMapped !== KEYWORD_STRATEGY_ROWS.length) fail('keyword report mapped-keyword count is stale');
  if (report.summary?.keywordCannibalizationConflicts !== 0) fail(`keyword report records ${report.summary.keywordCannibalizationConflicts} ownership conflict(s)`);
  if (!Array.isArray(report.keywordCannibalizationDetails)) fail('keyword report is missing computed cannibalization details');
}

if (briefs) {
  if (briefs.generatedOn !== generatedOn) fail(`keyword briefs are stale: expected generatedOn ${generatedOn}, found ${briefs.generatedOn}`);
  if (briefs.briefs?.length !== KEYWORD_PAGE_ARCHITECTURE.length) fail('keyword brief count does not match content architecture');
}

if (indexabilityMap) {
  if (indexabilityMap.summary?.keywordCount !== KEYWORD_STRATEGY_ROWS.length) fail('indexability map keyword count is stale');
  if (indexabilityMap.summary?.targetCount !== KEYWORD_PAGE_ARCHITECTURE.length) fail('indexability map target count is stale');
  if (indexabilityMap.summary?.orphanTargets?.length !== 0) fail('indexability map contains orphan targets');
  if (indexabilityMap.summary?.audited !== true) fail('indexability map is not based on an audited build');
}

if (failures.length > 0) {
  console.error(`\nPhase 2 keyword ownership gate failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`\nPhase 2 keyword ownership gate passed: ${KEYWORD_STRATEGY_ROWS.length} keywords, ${KEYWORD_PAGE_ARCHITECTURE.length} canonical owners, ${INDEXABLE_ROUTES.length} indexable routes, current generated artifacts, and no computed cannibalization conflicts.`);
