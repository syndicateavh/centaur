#!/usr/bin/env node

import { REGIONAL_MARKETS } from '../src/analytics/measurementTaxonomy.js';
import { REGIONAL_PAGES } from '../src/content/regionalPages.js';
import { KEYWORD_STRATEGY_ROWS, getKeywordOwnership } from '../src/seo/keywordMap.js';
import { INDEXABLE_ROUTES } from '../src/seo/seoRoutes.js';

const failures = [];
const routeByPath = new Map(INDEXABLE_ROUTES.map((route) => [route.path, route]));

function fail(message) {
  failures.push(message);
}

for (const page of REGIONAL_PAGES) {
  const route = routeByPath.get(page.path);
  const ownership = getKeywordOwnership(page.path);
  const rows = KEYWORD_STRATEGY_ROWS.filter((row) => row.targetUrl === page.path);

  if (!route?.indexable) fail(`${page.path}: regional keyword owner must be an indexable route`);
  if (!ownership) {
    fail(`${page.path}: regional page is missing a canonical keyword owner`);
    continue;
  }
  if (ownership.primaryKeyword !== page.primaryKeyword) {
    fail(`${page.path}: content primary keyword does not match keyword ownership (${page.primaryKeyword} !== ${ownership.primaryKeyword})`);
  }
  if (ownership.keywordCount !== rows.length) {
    fail(`${page.path}: keyword ownership count ${ownership.keywordCount} does not match strategy rows ${rows.length}`);
  }
  if (!rows.some((row) => row.keyword === page.primaryKeyword)) {
    fail(`${page.path}: primary keyword is not present in the imported strategy rows`);
  }
  if (rows.some((row) => /\bonline\b/i.test(row.keyword))) {
    fail(`${page.path}: a regional page owns an online-intent keyword; online access belongs to the national/course owner unless separately approved`);
  }
  if (REGIONAL_MARKETS[page.path] !== page.id.replaceAll('-', '_')) {
    fail(`${page.path}: measurement market does not match the regional content ID`);
  }
}

const onlineIndiaRows = KEYWORD_STRATEGY_ROWS.filter((row) => /\bonline\b/i.test(row.keyword) && /\bindia\b/i.test(row.keyword));
if (onlineIndiaRows.length === 0) fail('online India keyword ownership is missing from the imported strategy');
for (const row of onlineIndiaRows) {
  if (!['/india/', '/courses/'].includes(row.targetUrl)) {
    fail(`${row.keyword}: online India intent must remain owned by /india/ or /courses/, found ${row.targetUrl}`);
  }
}

if (failures.length > 0) {
  console.error(`Regional keyword ownership verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Regional keyword ownership verified: ${REGIONAL_PAGES.length} regional owners, ${onlineIndiaRows.length} online-India owners, one canonical owner per published regional cluster, and no regional/online ownership collision.`);
