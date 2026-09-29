#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {
  SEARCH_CONSOLE_PAGE_SNAPSHOT_FILE,
  SEARCH_CONSOLE_QUERY_SNAPSHOT_FILE,
} from '../src/content/seo/measurementSchema.js';

const failures = [];

function requireText(file, expected, label) {
  const filePath = path.resolve(file);
  if (!fs.existsSync(filePath)) {
    failures.push(`${label} is missing: ${file}`);
    return;
  }
  const source = fs.readFileSync(filePath, 'utf8');
  for (const value of expected) if (!source.includes(value)) failures.push(`${label} is missing required maintenance control: ${value}`);
}

if (SEARCH_CONSOLE_QUERY_SNAPSHOT_FILE === SEARCH_CONSOLE_PAGE_SNAPSHOT_FILE) {
  failures.push('query and page Search Console dimensions must have separate storage');
}

requireText('docs/SEO_MEASUREMENT_AND_MAINTENANCE.md', [
  'Monthly cycle',
  '28-day windows',
  'Landing-page leads',
  'Indexing',
  'Quarterly',
  'Financial Operations Masterclass is the only current offering',
], 'Phase 7 maintenance runbook');
requireText('src/content/seo/measurements/README.md', [
  'git-ignored',
  'Queries** table',
  'Pages** table',
  'Import the older comparison period first',
], 'measurement storage guide');
requireText('tools/import-search-console.js', [
  'SEARCH_CONSOLE_SNAPSHOT_FILES',
  'dateRange',
  'archiveSnapshotBeforeReplace',
  'outside the configured site',
], 'Search Console period importer');
requireText('tools/seo-measurement-report.js', [
  'priorComparableSnapshot',
  'KEYWORD_PAGE_ARCHITECTURE',
  'Manual page-review flags',
  'missing rows are not treated as zero',
], 'measurement report');
requireText('tools/test-seo-measurement.js', [
  'period exports without a Date column must require an explicit date range',
  'replacing a query-period snapshot must archive the previous period',
  'page imports must not overwrite query data',
  'backlink audit targets outside the configured site must be rejected',
  'Refusing to remove unexpected measurement-test path',
], 'measurement workflow tests');
requireText('.gitignore', [
  'src/content/seo/measurements/*.json',
  'src/content/seo/measurements/history/*.json',
  'src/content/seo/measurements/SEO_MEASUREMENT_REPORT.md',
], 'measurement privacy exclusions');

const missingLiveDimensions = [
  !fs.existsSync(SEARCH_CONSOLE_QUERY_SNAPSHOT_FILE) ? 'query' : null,
  !fs.existsSync(SEARCH_CONSOLE_PAGE_SNAPSHOT_FILE) ? 'page' : null,
].filter(Boolean);

if (failures.length > 0) {
  console.error(`Phase 7 measurement and maintenance verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

const evidenceStatus = missingLiveDimensions.length
  ? `authorized Search Console ${missingLiveDimensions.join(' and ')} export${missingLiveDimensions.length > 1 ? 's are' : ' is'} still needed for the live baseline`
  : 'separate local query and page snapshots are available for validation';
console.log(`Phase 7 workflow verified: separate period-aware imports, private history, evidence-only reporting, monthly/quarterly maintenance controls; ${evidenceStatus}.`);
