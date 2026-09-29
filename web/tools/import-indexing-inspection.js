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
import { findColumn, normalizeHeader, parseCsv } from './seo-csv.js';

function parseArguments(args) {
  const options = { inputPath: null, date: null };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--date') {
      const value = args[index + 1];
      if (!value || value.startsWith('--')) throw new Error('--date requires YYYY-MM-DD');
      options.date = value;
      index += 1;
    } else if (argument === '--help') options.help = true;
    else if (argument.startsWith('--')) throw new Error(`Unknown option: ${argument}`);
    else if (options.inputPath) throw new Error('Only one inspection export path may be supplied');
    else options.inputPath = argument;
  }
  if (!options.inputPath && !options.help) throw new Error('A Google Search Console inspection CSV or JSON path is required');
  return options;
}

function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) throw new Error(`Invalid observation date: ${value}`);
  return value;
}

function normalizeDateTime(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function apiRecord(url, payload) {
  const result = payload?.inspectionResult || payload || {};
  const indexStatus = result.indexStatusResult || {};
  return {
    url,
    path: new URL(url).pathname,
    status: classifyInspectionStatus({
      verdict: indexStatus.verdict,
      coverageState: indexStatus.coverageState,
      indexingState: indexStatus.indexingState,
      pageFetchState: indexStatus.pageFetchState,
      error: indexStatus.robotsTxtState,
    }),
    verdict: indexStatus.verdict || null,
    coverageState: indexStatus.coverageState || null,
    indexingState: indexStatus.indexingState || null,
    pageFetchState: indexStatus.pageFetchState || null,
    robotsTxtState: indexStatus.robotsTxtState || null,
    googleCanonical: indexStatus.googleCanonical || null,
    userCanonical: indexStatus.userCanonical || null,
    lastCrawledAt: normalizeDateTime(indexStatus.lastCrawlTime),
    reason: indexStatus.coverageState || null,
  };
}

function csvRecords(text, manifestUrls) {
  const rows = parseCsv(text);
  if (rows.length < 2) throw new Error('The inspection CSV has no data rows');
  const headers = rows[0].map(normalizeHeader);
  const urlColumn = findColumn(headers, [/^url$/, /^page$/, /^inspection url$/, /^tested url$/]);
  if (urlColumn < 0) throw new Error('The inspection CSV must contain a URL, Page, or Inspection URL column');
  const statusColumn = findColumn(headers, [/^status$/, /^indexing status$/, /^indexing state$/]);
  const verdictColumn = findColumn(headers, [/^verdict$/]);
  const coverageColumn = findColumn(headers, [/^coverage state$/, /^coverage$/]);
  const indexingColumn = findColumn(headers, [/^indexing state$/]);
  const fetchColumn = findColumn(headers, [/^page fetch state$/, /^page fetch$/]);
  const robotsColumn = findColumn(headers, [/^robots txt state$/, /^robots txt$/]);
  const reasonColumn = findColumn(headers, [/^reason$/, /^issue$/, /^details$/]);
  const googleCanonicalColumn = findColumn(headers, [/^google selected canonical$/, /^google canonical$/]);
  const userCanonicalColumn = findColumn(headers, [/^user declared canonical$/, /^user canonical$/]);
  const lastCrawledColumn = findColumn(headers, [/^last crawled$/, /^last crawl time$/, /^last crawl$/]);
  return rows.slice(1).map((row, index) => {
    const rowNumber = index + 2;
    const rawUrl = String(row[urlColumn] || '').trim();
    if (!rawUrl) throw new Error(`Row ${rowNumber}: URL is required`);
    const url = normalizeIndexingUrl(rawUrl);
    if (!manifestUrls.has(url)) throw new Error(`Row ${rowNumber}: URL is not in the current indexing manifest: ${url}`);
    const verdict = verdictColumn >= 0 ? String(row[verdictColumn] || '').trim() : '';
    const coverageState = coverageColumn >= 0 ? String(row[coverageColumn] || '').trim() : '';
    const indexingState = indexingColumn >= 0 ? String(row[indexingColumn] || '').trim() : '';
    const pageFetchState = fetchColumn >= 0 ? String(row[fetchColumn] || '').trim() : '';
    const robotsTxtState = robotsColumn >= 0 ? String(row[robotsColumn] || '').trim() : '';
    const status = statusColumn >= 0 ? String(row[statusColumn] || '').trim() : '';
    const reason = reasonColumn >= 0 ? String(row[reasonColumn] || '').trim() : '';
    return {
      url,
      path: new URL(url).pathname,
      status: classifyInspectionStatus({ verdict: `${verdict} ${status}`, coverageState, indexingState, pageFetchState, error: `${robotsTxtState} ${reason}` }),
      verdict: verdict || null,
      coverageState: coverageState || null,
      indexingState: indexingState || null,
      pageFetchState: pageFetchState || null,
      robotsTxtState: robotsTxtState || null,
      googleCanonical: googleCanonicalColumn >= 0 ? String(row[googleCanonicalColumn] || '').trim() || null : null,
      userCanonical: userCanonicalColumn >= 0 ? String(row[userCanonicalColumn] || '').trim() || null : null,
      lastCrawledAt: lastCrawledColumn >= 0 ? normalizeDateTime(row[lastCrawledColumn]) : null,
      reason: reason || coverageState || status || null,
    };
  });
}

function archiveLatestSnapshot() {
  const latestPath = path.resolve(INDEXING_INSPECTION_FILE);
  if (!fs.existsSync(latestPath)) return null;
  const previous = JSON.parse(fs.readFileSync(latestPath, 'utf8'));
  const stamp = String(previous.importedAt || new Date().toISOString()).replace(/[^0-9TZ-]/g, '');
  const historyDirectory = path.resolve(INDEXING_INSPECTION_HISTORY_DIRECTORY);
  fs.mkdirSync(historyDirectory, { recursive: true });
  const archivePath = path.join(historyDirectory, `indexing-${stamp}.json`);
  fs.copyFileSync(latestPath, archivePath);
  return archivePath;
}

const options = parseArguments(process.argv.slice(2));
if (options.help) {
  console.log('Usage: node tools/import-indexing-inspection.js C:\\path\\inspection.csv --date 2026-09-24');
  console.log('The import accepts a Search Console inspection CSV or a saved URL Inspection API JSON response.');
  process.exit(0);
}

const manifest = JSON.parse(fs.readFileSync(path.resolve(INDEXING_MANIFEST_FILE), 'utf8'));
const manifestErrors = validateIndexingManifest(manifest);
if (manifestErrors.length > 0) throw new Error(`Indexing manifest is invalid:\n- ${manifestErrors.join('\n- ')}`);
const manifestUrls = new Set(manifest.urls.map((entry) => entry.url));
const inputPath = path.resolve(options.inputPath);
const inputText = fs.readFileSync(inputPath, 'utf8').replace(/^\uFEFF/, '');
const isJson = inputPath.toLowerCase().endsWith('.json') || inputText.trimStart().startsWith('{') || inputText.trimStart().startsWith('[');
const parsed = isJson ? JSON.parse(inputText) : null;
const rawRecords = isJson
  ? (Array.isArray(parsed) ? parsed : Array.isArray(parsed.records) ? parsed.records : [parsed])
  : null;
const records = rawRecords
  ? rawRecords.map((record) => {
    const rawUrl = record.url || record.inspectionUrl || record.inspectionResult?.inspectionUrl;
    const url = normalizeIndexingUrl(rawUrl);
    if (!manifestUrls.has(url)) throw new Error(`Inspection response URL is not in the current manifest: ${url}`);
    return record.status && record.path
      ? { ...record, url, path: new URL(url).pathname }
      : apiRecord(url, record);
  })
  : csvRecords(inputText, manifestUrls);
const observationDate = options.date || parsed?.observationDate || new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Calcutta' }).format(new Date());
const snapshot = {
  schemaVersion: INDEXING_SCHEMA_VERSION,
  source: isJson ? 'Google Search Console URL Inspection API export' : 'Google Search Console indexing inspection CSV export',
  sourceFile: options.inputPath,
  siteOrigin: SITE_ORIGIN,
  propertyUrl: `${SITE_ORIGIN}/`,
  observationDate: validDate(observationDate),
  importedAt: new Date().toISOString(),
  records,
};
const errors = validateIndexingInspectionSnapshot(snapshot, manifestUrls);
if (errors.length > 0) throw new Error(`Indexing inspection snapshot validation failed:\n- ${errors.join('\n- ')}`);

const archivePath = archiveLatestSnapshot();
const outputPath = path.resolve(INDEXING_INSPECTION_FILE);
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
console.log(`Imported ${records.length} indexing inspection records into ${path.relative(process.cwd(), outputPath)}.`);
if (archivePath) console.log(`Previous inspection snapshot archived at ${path.relative(process.cwd(), archivePath)}.`);
