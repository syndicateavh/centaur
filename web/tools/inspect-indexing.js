#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { SITE_ORIGIN } from '../src/seo/siteConfig.js';
import {
  INDEXING_INSPECTION_FILE,
  INDEXING_INSPECTION_HISTORY_DIRECTORY,
  INDEXING_MANIFEST_FILE,
  INDEXING_SCHEMA_VERSION,
  classifyInspectionStatus,
  normalizeIndexingUrl,
  validateIndexingManifest,
  validateIndexingInspectionSnapshot,
} from '../src/content/seo/indexingSchema.js';
import { INDEXING_PRIORITY_PATHS } from '../src/content/seo/indexingPriority.js';

function parseArguments(args) {
  const options = { urls: [], all: false, priority: false, live: false, confirm: false, limit: null };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--url') {
      const value = args[index + 1];
      if (!value || value.startsWith('--')) throw new Error('--url requires a canonical site URL or path');
      options.urls.push(value);
      index += 1;
    } else if (argument === '--all') options.all = true;
    else if (argument === '--priority') options.priority = true;
    else if (argument === '--live') options.live = true;
    else if (argument === '--confirm') options.confirm = true;
    else if (argument === '--limit') {
      const value = Number(args[index + 1]);
      if (!Number.isInteger(value) || value <= 0) throw new Error('--limit requires a positive integer');
      options.limit = value;
      index += 1;
    } else if (argument === '--help') options.help = true;
    else throw new Error(`Unknown option: ${argument}`);
  }
  return options;
}

function archiveLatestSnapshot() {
  const latestPath = path.resolve(INDEXING_INSPECTION_FILE);
  if (!fs.existsSync(latestPath)) return null;
  const previous = JSON.parse(fs.readFileSync(latestPath, 'utf8'));
  const importedAt = String(previous.importedAt || new Date().toISOString()).replace(/[^0-9TZ-]/g, '');
  const historyDirectory = path.resolve(INDEXING_INSPECTION_HISTORY_DIRECTORY);
  fs.mkdirSync(historyDirectory, { recursive: true });
  const archivePath = path.join(historyDirectory, `indexing-${importedAt}.json`);
  fs.copyFileSync(latestPath, archivePath);
  return archivePath;
}

function normalizeGoogleDateTime(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function inspectionRecord(url, payload, errorMessage = null) {
  const result = payload?.inspectionResult || {};
  const indexStatus = result.indexStatusResult || {};
  const status = errorMessage ? 'error' : classifyInspectionStatus({
    verdict: indexStatus.verdict,
    coverageState: indexStatus.coverageState,
    indexingState: indexStatus.indexingState,
    pageFetchState: indexStatus.pageFetchState,
    error: indexStatus.robotsTxtState,
  });
  return {
    url,
    path: new URL(url).pathname,
    status,
    verdict: indexStatus.verdict || null,
    coverageState: indexStatus.coverageState || null,
    indexingState: indexStatus.indexingState || null,
    pageFetchState: indexStatus.pageFetchState || null,
    robotsTxtState: indexStatus.robotsTxtState || null,
    googleCanonical: indexStatus.googleCanonical || null,
    userCanonical: indexStatus.userCanonical || null,
    lastCrawledAt: normalizeGoogleDateTime(indexStatus.lastCrawlTime),
    reason: errorMessage || indexStatus.coverageState || null,
  };
}

const options = parseArguments(process.argv.slice(2));
if (options.help) {
  console.log('Usage: node tools/inspect-indexing.js --url /courses/ [--live --confirm]');
  console.log('Use --priority for the regional, operations, and commercial inspection queue, or --all for every manifest URL. Dry-run is the default.');
  process.exit(0);
}
if (options.all && (options.urls.length > 0 || options.priority)) throw new Error('Use --all, --priority, or --url, not combinations of them');
if (options.priority && options.urls.length > 0) throw new Error('Use --priority or --url, not both');
if (!options.all && !options.priority && options.urls.length === 0) throw new Error('Provide --url <path>, --priority, or --all');

const manifestPath = path.resolve(INDEXING_MANIFEST_FILE);
if (!fs.existsSync(manifestPath)) throw new Error(`Indexing manifest is missing: ${path.relative(process.cwd(), manifestPath)}. Run npm run seo:indexing:manifest first.`);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const manifestErrors = validateIndexingManifest(manifest);
if (manifestErrors.length > 0) throw new Error(`Indexing manifest is invalid:\n- ${manifestErrors.join('\n- ')}`);

const manifestUrls = new Set(manifest.urls.map((entry) => entry.url));
let targetUrls = options.all
  ? manifest.urls.map((entry) => entry.url)
  : options.priority
    ? INDEXING_PRIORITY_PATHS.map((value) => normalizeIndexingUrl(value))
    : options.urls.map((value) => normalizeIndexingUrl(value));
if (options.limit) targetUrls = targetUrls.slice(0, options.limit);
const unknownUrls = targetUrls.filter((url) => !manifestUrls.has(url));
if (unknownUrls.length > 0) throw new Error(`Requested URL is not in the current indexing manifest: ${unknownUrls.join(', ')}`);
targetUrls = [...new Set(targetUrls)];

if (!options.live) {
  const queueName = options.priority ? 'priority' : options.all ? 'complete manifest' : 'requested';
  console.log(`Indexing inspection plan: ${targetUrls.length} URL${targetUrls.length === 1 ? '' : 's'} selected from the ${queueName} queue.`);
  console.log('No Search Console request was sent. Add --live --confirm with GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN to collect evidence.');
  for (const url of targetUrls) console.log(`- ${url}`);
  process.exit(0);
}

if (!options.confirm) throw new Error('Live URL inspection requires --confirm. This calls the Google Search Console API.');
const accessToken = process.env.GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN;
if (!accessToken) throw new Error('Live URL inspection requires GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN; no token was stored or read from a file.');

const records = [];
let requestFailures = 0;
for (const url of targetUrls) {
  const response = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ inspectionUrl: url, siteUrl: `${SITE_ORIGIN}/`, languageCode: 'en-US' }),
  });
  if (!response.ok) {
    requestFailures += 1;
    records.push(inspectionRecord(url, null, `HTTP ${response.status}: ${(await response.text()).slice(0, 500)}`));
    continue;
  }
  records.push(inspectionRecord(url, await response.json()));
}

const snapshot = {
  schemaVersion: INDEXING_SCHEMA_VERSION,
  source: 'Google Search Console URL Inspection API',
  siteOrigin: SITE_ORIGIN,
  propertyUrl: `${SITE_ORIGIN}/`,
  observationDate: new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date()),
  importedAt: new Date().toISOString(),
  records,
};
const snapshotErrors = validateIndexingInspectionSnapshot(snapshot, manifestUrls);
if (snapshotErrors.length > 0) throw new Error(`Indexing inspection snapshot validation failed:\n- ${snapshotErrors.join('\n- ')}`);

const archivePath = archiveLatestSnapshot();
const outputPath = path.resolve(INDEXING_INSPECTION_FILE);
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
console.log(`Saved ${records.length} URL inspection records to ${path.relative(process.cwd(), outputPath)}.`);
if (archivePath) console.log(`Previous inspection snapshot archived at ${path.relative(process.cwd(), archivePath)}.`);
if (requestFailures > 0) {
  console.error(`${requestFailures} URL inspection request${requestFailures === 1 ? '' : 's'} failed; those records are marked error and require a later retry.`);
  process.exitCode = 1;
}
