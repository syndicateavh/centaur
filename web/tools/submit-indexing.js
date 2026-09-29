#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { SITE_ORIGIN } from '../src/seo/siteConfig.js';
import {
  INDEXING_MANIFEST_FILE,
  INDEXING_SCHEMA_VERSION,
  INDEXING_SUBMISSIONS_DIRECTORY,
  validateIndexingManifest,
  validateIndexingSubmissionReceipt,
} from '../src/content/seo/indexingSchema.js';

function parseArguments(args) {
  const options = { live: false, confirm: false };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--live') options.live = true;
    else if (argument === '--confirm') options.confirm = true;
    else if (argument === '--help') options.help = true;
    else throw new Error(`Unknown option: ${argument}`);
  }
  return options;
}

function writeReceipt(receipt) {
  const directory = path.resolve(INDEXING_SUBMISSIONS_DIRECTORY);
  fs.mkdirSync(directory, { recursive: true });
  const stamp = receipt.requestedAt.replace(/[-:.]/g, '').replace('Z', 'Z');
  const filePath = path.join(directory, `sitemap-${stamp}.json`);
  fs.writeFileSync(filePath, `${JSON.stringify(receipt, null, 2)}\n`, 'utf8');
  return filePath;
}

const options = parseArguments(process.argv.slice(2));
if (options.help) {
  console.log('Usage: node tools/submit-indexing.js [--live --confirm]');
  console.log('Default mode creates an evidence-free submission plan. Live mode requires GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN.');
  process.exit(0);
}

const manifestPath = path.resolve(INDEXING_MANIFEST_FILE);
if (!fs.existsSync(manifestPath)) throw new Error(`Indexing manifest is missing: ${path.relative(process.cwd(), manifestPath)}. Run npm run seo:indexing:manifest first.`);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const manifestErrors = validateIndexingManifest(manifest);
if (manifestErrors.length > 0) throw new Error(`Indexing manifest is invalid:\n- ${manifestErrors.join('\n- ')}`);

const requestedAt = new Date().toISOString();
const sitemapUrl = `${SITE_ORIGIN}/sitemap.xml`;
const receipt = {
  schemaVersion: INDEXING_SCHEMA_VERSION,
  type: 'sitemap',
  siteOrigin: SITE_ORIGIN,
  sitemapUrl,
  requestedAt,
  mode: options.live ? 'live' : 'dry-run',
  status: options.live ? 'failed' : 'planned',
  httpStatus: null,
  manifestUrlCount: manifest.urlCount,
  responseSummary: options.live ? null : 'No request sent. Run with --live --confirm after configuring an authorized Search Console access token.',
};

if (!options.live) {
  const receiptPath = writeReceipt(receipt);
  console.log(`Indexing submission plan created for ${sitemapUrl} (${manifest.urlCount} URLs).`);
  console.log(`No external request was sent. Receipt: ${path.relative(process.cwd(), receiptPath)}`);
  process.exit(0);
}

if (!options.confirm) throw new Error('Live sitemap submission requires --confirm. This calls the Google Search Console API.');
const accessToken = process.env.GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN;
if (!accessToken) throw new Error('Live sitemap submission requires GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN in the environment; no token was stored or read from a file.');

const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(`${SITE_ORIGIN}/`)}/sitemaps/${encodeURIComponent(sitemapUrl)}`;
const response = await fetch(endpoint, {
  method: 'PUT',
  headers: {
    Authorization: `Bearer ${accessToken}`,
    Accept: 'application/json',
  },
});
const responseText = await response.text();
receipt.httpStatus = response.status;
receipt.status = response.ok ? 'submitted' : 'failed';
receipt.responseSummary = responseText.slice(0, 1000) || response.statusText;
const receiptPath = writeReceipt(receipt);
const receiptErrors = validateIndexingSubmissionReceipt(receipt);
if (receiptErrors.length > 0) throw new Error(`Submission receipt validation failed:\n- ${receiptErrors.join('\n- ')}`);
if (!response.ok) throw new Error(`Search Console sitemap submission failed with HTTP ${response.status}. Receipt: ${path.relative(process.cwd(), receiptPath)}`);
console.log(`Sitemap submitted to Search Console: ${sitemapUrl}. Receipt: ${path.relative(process.cwd(), receiptPath)}`);
