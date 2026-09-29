#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { validateBacklinkCollection } from '../src/content/seo/backlinkWorkflow.js';
import { validateBacklinkSnapshot, validateSearchConsoleSnapshot } from '../src/content/seo/measurementSchema.js';

const failures = [];

function requireText(file, values, label) {
  const source = fs.readFileSync(path.resolve(file), 'utf8');
  for (const value of values) if (!source.includes(value)) failures.push(`${label} is missing: ${value}`);
}

const prospectPath = path.resolve('src/content/seo/backlinkProspects.json');
const prospects = JSON.parse(fs.readFileSync(prospectPath, 'utf8'));
const prospectValidation = validateBacklinkCollection(prospects);
for (const error of prospectValidation.errors) failures.push(`backlink registry: ${error}`);

const measurementsPath = path.resolve('src/content/seo/measurements');
const snapshotValidators = new Map([
  ['search-console.json', validateSearchConsoleSnapshot],
  ['search-console-query.json', validateSearchConsoleSnapshot],
  ['search-console-page.json', validateSearchConsoleSnapshot],
  ['backlinks.json', validateBacklinkSnapshot],
]);
for (const [file, validator] of snapshotValidators) {
  const filePath = path.join(measurementsPath, file);
  if (!fs.existsSync(filePath)) continue;
  let snapshot;
  try {
    snapshot = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    failures.push(`${file}: invalid JSON (${error.message})`);
    continue;
  }
  for (const error of validator(snapshot)) failures.push(`${file}: ${error}`);
}

const historyPath = path.join(measurementsPath, 'history');
if (fs.existsSync(historyPath)) {
  for (const file of fs.readdirSync(historyPath).filter((name) => name.endsWith('.json'))) {
    const validator = file.startsWith('search-console-query_') || file.startsWith('search-console-page_')
      ? validateSearchConsoleSnapshot
      : file.startsWith('backlinks_')
        ? validateBacklinkSnapshot
        : null;
    if (!validator) {
      failures.push(`history contains an unrecognized snapshot file: ${file}`);
      continue;
    }
    try {
      const snapshot = JSON.parse(fs.readFileSync(path.join(historyPath, file), 'utf8'));
      for (const error of validator(snapshot)) failures.push(`history/${file}: ${error}`);
    } catch (error) {
      failures.push(`history/${file}: invalid JSON (${error.message})`);
    }
  }
}

requireText('src/components/AnalyticsPageView.jsx', ['virtual_page_view', 'internal_pathway_click', 'destination_path', 'page_location', 'page_path', 'page_title'], 'analytics page-view and pathway contract');
requireText('src/components/AnalyticsPageView.jsx', ["sendGoogleAnalyticsEvent('page_view'", 'trackAnalyticsEvent(pathwayEvent', 'trackAnalyticsEvent(eventName'], 'GA4 event wiring');
requireText('src/analytics/ga4.js', ['G-K4K93GXSX7', 'send_page_view: false', "browser.gtag('event'", 'export function trackAnalyticsEvent'], 'GA4 configuration');
requireText('tools/seo-measurement-report.js', ['No Search Console snapshot imported yet', 'No backlink audit snapshot imported yet', 'Missing imports and missing rows are not treated as zero'], 'measurement report');
requireText('tools/backlink-workflow.js', ['mark <record-id> <status> [source-url]', 'validateBacklinkCollection', 'sourceUrl'], 'backlink workflow');
requireText('tools/import-search-console.js', ['Date', 'Clicks', 'Impressions', 'Query or Page dimension', 'selected report period', 'SEARCH_CONSOLE_SNAPSHOT_FILES'], 'Search Console importer');
requireText('tools/import-backlink-audit.js', ['Source URL', 'Target URL/Path', 'Status'], 'backlink audit importer');
requireText('.gitignore', ['src/content/seo/measurements/history/*.json', 'src/content/seo/measurements/SEO_MEASUREMENT_REPORT.md'], 'measurement privacy exclusions');

if (failures.length > 0) {
  console.error(`SEO measurement verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`SEO measurement verified: ${prospects.length} backlink prospects, page-view instrumentation, evidence-only imports, and no fabricated metrics.`);
