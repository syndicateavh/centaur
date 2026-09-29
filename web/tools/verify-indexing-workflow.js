#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {
  INDEXING_INSPECTION_FILE,
  INDEXING_MANIFEST_FILE,
  INDEXING_SUBMISSIONS_DIRECTORY,
  validateIndexingManifest,
  validateIndexingInspectionSnapshot,
  validateIndexingSubmissionReceipt,
} from '../src/content/seo/indexingSchema.js';
import { INDEXING_PRIORITY_ENTRIES, INDEXING_PRIORITY_PATHS } from '../src/content/seo/indexingPriority.js';
const failures = [];
function fail(message) { failures.push(message); }
function readJson(filePath, label) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    fail(`${label}: invalid JSON (${error.message})`);
    return null;
  }
}

const manifestPath = path.resolve(INDEXING_MANIFEST_FILE);
if (!fs.existsSync(manifestPath)) {
  fail(`indexing manifest is missing: ${path.relative(process.cwd(), manifestPath)}; run the production build or npm run seo:indexing:manifest`);
} else {
  const manifest = readJson(manifestPath, 'indexing manifest');
  if (manifest) {
    for (const error of validateIndexingManifest(manifest)) fail(`indexing manifest: ${error}`);

    const sitemapPath = path.resolve('public/sitemap.xml');
    if (!fs.existsSync(sitemapPath)) fail('public/sitemap.xml is missing');
    else {
      const sitemapUrls = [...fs.readFileSync(sitemapPath, 'utf8').matchAll(/<loc>([\s\S]*?)<\/loc>/gi)]
        .map((match) => match[1].replaceAll('&amp;', '&'))
        .sort();
      const manifestUrls = manifest.urls.map((entry) => entry.url).sort();
      if (JSON.stringify(sitemapUrls) !== JSON.stringify(manifestUrls)) fail('indexing manifest URLs do not exactly match public/sitemap.xml');
    }

    const manifestUrlSet = new Set(manifest.urls.map((entry) => entry.url));
    const priorityPaths = new Set();
    for (const entry of INDEXING_PRIORITY_ENTRIES) {
      if (priorityPaths.has(entry.path)) fail(`indexing priority queue contains a duplicate path: ${entry.path}`);
      priorityPaths.add(entry.path);
      const priorityUrl = `${manifest.siteOrigin}${entry.path}`;
      if (!manifestUrlSet.has(priorityUrl)) fail(`indexing priority queue path is not in the current manifest: ${entry.path}`);
    }
    if (priorityPaths.size !== INDEXING_PRIORITY_PATHS.length) fail('indexing priority queue path list does not match its entry list');
    if (INDEXING_PRIORITY_ENTRIES.length === 0) fail('indexing priority queue must contain at least one URL');

    const manifestUrls = new Set(manifest.urls.map((entry) => entry.url));
    const inspectionPath = path.resolve(INDEXING_INSPECTION_FILE);
    if (fs.existsSync(inspectionPath)) {
      const snapshot = readJson(inspectionPath, 'latest indexing inspection snapshot');
      if (snapshot) {
        for (const error of validateIndexingInspectionSnapshot(snapshot, manifestUrls)) fail(`latest indexing inspection: ${error}`);
        if (!/Google Search Console/i.test(snapshot.source || '')) fail('latest indexing inspection must identify Google Search Console as its source');
        if (JSON.stringify(snapshot).includes('Bearer ')) fail('latest indexing inspection must not contain an access token');
        if (snapshot.records.some((record) => record.status === 'indexed' && !/Google Search Console/i.test(snapshot.source || ''))) {
          fail('indexed status must come from an identified Google Search Console evidence source');
        }
      }
    }
  }
}

const submissionsDirectory = path.resolve(INDEXING_SUBMISSIONS_DIRECTORY);
if (fs.existsSync(submissionsDirectory)) {
  for (const file of fs.readdirSync(submissionsDirectory).filter((name) => name.endsWith('.json'))) {
    const receipt = readJson(path.join(submissionsDirectory, file), `submission receipt ${file}`);
    if (!receipt) continue;
    for (const error of validateIndexingSubmissionReceipt(receipt)) fail(`submission receipt ${file}: ${error}`);
    if (JSON.stringify(receipt).includes('Bearer ') || JSON.stringify(receipt).includes('GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN')) fail(`submission receipt ${file}: token material must not be recorded`);
  }
}

for (const [file, expected] of [
  ['tools/submit-indexing.js', ['--live', '--confirm', 'GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN', 'sitemap']],
  ['tools/inspect-indexing.js', ['urlInspection/index:inspect', '--all', '--priority', '--confirm', 'INDEXING_PRIORITY_PATHS']],
  ['tools/monitor-indexing.js', ['pending_submission', 'submitted_pending_inspection', 'not_indexed']],
  ['tools/import-indexing-inspection.js', ['Google Search Console', 'observationDate']],
]) {
  const source = fs.readFileSync(path.resolve(file), 'utf8');
  for (const text of expected) if (!source.includes(text)) fail(`${file} is missing the indexing control: ${text}`);
}

if (failures.length > 0) {
  console.error(`Indexing workflow verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

const manifest = fs.existsSync(manifestPath) ? readJson(manifestPath, 'indexing manifest') : null;
const inspection = fs.existsSync(path.resolve(INDEXING_INSPECTION_FILE)) ? readJson(path.resolve(INDEXING_INSPECTION_FILE), 'latest indexing inspection snapshot') : null;
console.log(`Indexing workflow verified: ${manifest?.urlCount || 0} canonical sitemap URLs, ${INDEXING_PRIORITY_ENTRIES.length} priority inspection URLs, ${inspection?.records.length || 0} inspected URLs, evidence-only submissions, and no fabricated index status.`);
