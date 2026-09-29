#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {
  INDIA_LEAD_INTENT_PAGE_REGISTER,
  INDEXING_PRIORITY_PATHS,
} from '../src/content/seo/indexingPriority.js';

const failures = [];
const manifestPath = path.resolve('data/seo/indexing/indexing-manifest.json');

function fail(message) {
  failures.push(message);
}

if (!fs.existsSync(manifestPath)) {
  fail('indexing manifest is missing; run the production build first');
} else {
  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch (error) {
    fail(`indexing manifest is invalid: ${error.message}`);
  }

  if (manifest) {
    const sitemapPaths = new Set(manifest.urls.map((entry) => entry.path));
    const priorityPaths = new Set(INDEXING_PRIORITY_PATHS);
    const ids = new Set();
    const keywords = new Set();
    const newEntries = [];
    const existingEntries = [];

    if (INDIA_LEAD_INTENT_PAGE_REGISTER.length !== 20) {
      fail(`expected 20 India lead-intent criteria, found ${INDIA_LEAD_INTENT_PAGE_REGISTER.length}`);
    }

    for (const entry of INDIA_LEAD_INTENT_PAGE_REGISTER) {
      if (ids.has(entry.id)) fail(`duplicate criterion id: ${entry.id}`);
      ids.add(entry.id);
      if (keywords.has(entry.primaryKeyword)) fail(`duplicate primary keyword: ${entry.primaryKeyword}`);
      keywords.add(entry.primaryKeyword);
      if (!Array.isArray(entry.canonicalPaths) || entry.canonicalPaths.length !== 1) {
        fail(`${entry.id}: exactly one canonical owner path is required`);
        continue;
      }
      if (!entry.stage || !entry.decision || !entry.leadAction || entry.status !== 'implemented') {
        fail(`${entry.id}: implementation metadata is incomplete`);
      }
      if (entry.decision === 'new-canonical') newEntries.push(entry);
      else if (entry.decision === 'existing-canonical') existingEntries.push(entry);
      else fail(`${entry.id}: unsupported owner decision ${entry.decision}`);
      if (entry.supportingPaths?.includes(entry.canonicalPaths[0])) {
        fail(`${entry.id}: canonical owner is also listed as a supporting page`);
      }
      for (const pagePath of [...entry.canonicalPaths, ...(entry.supportingPaths || [])]) {
        if (!/^\//.test(pagePath) || !pagePath.endsWith('/')) fail(`${entry.id}: non-canonical path format: ${pagePath}`);
        if (!sitemapPaths.has(pagePath)) fail(`${entry.id}: canonical path is not in the sitemap manifest: ${pagePath}`);
        if (!priorityPaths.has(pagePath)) fail(`${entry.id}: canonical path is missing from the indexing-priority queue: ${pagePath}`);
      }
    }

    if (newEntries.length !== 5) fail(`expected five new canonical owners, found ${newEntries.length}`);
    if (existingEntries.length !== 15) fail(`expected 15 consolidated existing owners, found ${existingEntries.length}`);
  }
}

if (failures.length > 0) {
  console.error(`India lead-intent page verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

const canonicalPathCount = new Set(INDIA_LEAD_INTENT_PAGE_REGISTER.flatMap((entry) => entry.canonicalPaths)).size;
console.log(`India lead-intent pages verified: 20 criteria mapped to ${canonicalPathCount} single canonical owners (five new, 15 existing), supporting pages, sitemap coverage, and indexing-priority coverage.`);
