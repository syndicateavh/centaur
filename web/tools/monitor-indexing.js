#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import {
  INDEXING_INSPECTION_FILE,
  INDEXING_MANIFEST_FILE,
  INDEXING_REPORT_FILE,
  INDEXING_SCHEMA_VERSION,
  INDEXING_SUBMISSIONS_DIRECTORY,
  validateIndexingManifest,
  validateIndexingInspectionSnapshot,
  validateIndexingSubmissionReceipt,
} from '../src/content/seo/indexingSchema.js';
import { INDEXING_PRIORITY_ENTRIES } from '../src/content/seo/indexingPriority.js';

const PUBLIC_CHECK_FILE = 'data/seo/indexing/public-checks/latest.json';

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const manifestPath = path.resolve(INDEXING_MANIFEST_FILE);
if (!fs.existsSync(manifestPath)) throw new Error(`Indexing manifest is missing: ${path.relative(process.cwd(), manifestPath)}. Run npm run seo:indexing:manifest first.`);
const manifest = readJson(manifestPath);
const manifestErrors = validateIndexingManifest(manifest);
if (manifestErrors.length > 0) throw new Error(`Indexing manifest is invalid:\n- ${manifestErrors.join('\n- ')}`);

const manifestUrls = new Set(manifest.urls.map((entry) => entry.url));
const manifestFingerprint = createHash('sha256').update([...manifestUrls].sort().join('\n')).digest('hex');
const snapshot = readJson(path.resolve(INDEXING_INSPECTION_FILE));
if (snapshot) {
  const errors = validateIndexingInspectionSnapshot(snapshot, manifestUrls);
  if (errors.length > 0) throw new Error(`Indexing inspection snapshot is invalid:\n- ${errors.join('\n- ')}`);
}

const submissionsDirectory = path.resolve(INDEXING_SUBMISSIONS_DIRECTORY);
const receipts = fs.existsSync(submissionsDirectory)
  ? fs.readdirSync(submissionsDirectory).filter((file) => file.endsWith('.json')).map((file) => ({ file, receipt: readJson(path.join(submissionsDirectory, file)) }))
  : [];
for (const { file, receipt } of receipts) {
  const errors = validateIndexingSubmissionReceipt(receipt);
  if (errors.length > 0) throw new Error(`Submission receipt ${file} is invalid:\n- ${errors.join('\n- ')}`);
}
receipts.sort((left, right) => String(right.receipt.requestedAt).localeCompare(String(left.receipt.requestedAt)));
const latestSubmissionActivity = receipts[0]?.receipt || null;
const latestSuccessfulSubmission = receipts.find(({ receipt }) => receipt.mode === 'live' && receipt.status === 'submitted')?.receipt || null;
// A receipt for a different manifest size cannot establish that this URL set was submitted.
const currentManifestSubmission = latestSuccessfulSubmission?.manifestUrlCount === manifest.urlCount
  ? latestSuccessfulSubmission
  : null;
const publicCheck = readJson(path.resolve(PUBLIC_CHECK_FILE));
if (publicCheck) {
  if (publicCheck.siteOrigin !== manifest.siteOrigin || !Array.isArray(publicCheck.records) || !Number.isInteger(publicCheck.manifestUrlCount)) {
    throw new Error('Public indexability snapshot is invalid: site origin, manifest count, or records are missing');
  }
  if (Number.isNaN(Date.parse(publicCheck.checkedAt || ''))) throw new Error('Public indexability snapshot has no valid checkedAt timestamp');
  const seen = new Set();
  for (const record of publicCheck.records) {
    if (seen.has(record.url)) throw new Error(`Public indexability snapshot contains a duplicate URL: ${record.url}`);
    if (!['public_fetchable', 'needs_review', 'request_error'].includes(record.status)) throw new Error(`Public indexability snapshot has an invalid status: ${record.status}`);
    seen.add(record.url);
  }
}
const publicCheckCurrent = publicCheck?.manifestFingerprint === manifestFingerprint;
const publicByUrl = new Map((publicCheckCurrent ? publicCheck.records : []).map((record) => [record.url, record]));
const inspectedByUrl = new Map((snapshot?.records || []).map((record) => [record.url, record]));
const statuses = new Map();
const rows = manifest.urls.map((entry) => {
  const record = inspectedByUrl.get(entry.url);
  const displayStatus = record?.status || (currentManifestSubmission ? 'submitted_pending_inspection' : 'pending_submission');
  statuses.set(displayStatus, (statuses.get(displayStatus) || 0) + 1);
  return { ...entry, record, displayStatus };
});

const pendingRows = rows.filter((row) => row.displayStatus !== 'indexed');
const rowsByPath = new Map(rows.map((row) => [row.path, row]));
const priorityRows = INDEXING_PRIORITY_ENTRIES.map((entry) => ({ ...entry, row: rowsByPath.get(entry.path) })).filter((entry) => entry.row);
const priorityPublicChecked = priorityRows.filter((entry) => publicByUrl.has(entry.row.url));
const publicIssues = priorityPublicChecked.filter((entry) => publicByUrl.get(entry.row.url)?.status !== 'public_fetchable');
const statusSummary = [...statuses.entries()].sort(([left], [right]) => left.localeCompare(right));
const report = `# SEO Indexing Report

Generated: ${new Date().toISOString()}

This report distinguishes repository sitemap entries, public HTTP fetches, recorded sitemap submissions, and observed Google index status. A public HTTP 200 or submitted sitemap is not evidence that Google indexed a URL. Missing inspection records remain unverified and are never treated as indexed.

## Coverage summary

- Canonical sitemap URLs: ${manifest.urlCount}
- Latest recorded sitemap activity: ${latestSubmissionActivity ? `${latestSubmissionActivity.status} at ${latestSubmissionActivity.requestedAt} (${latestSubmissionActivity.mode}; ${latestSubmissionActivity.manifestUrlCount} URLs in its manifest)` : 'no submission receipt recorded'}
- Successful live sitemap submission receipt at the current ${manifest.urlCount}-URL count: ${currentManifestSubmission ? currentManifestSubmission.requestedAt : 'no matching receipt recorded'}
- Latest Google inspection observation: ${snapshot ? `${snapshot.observationDate} (${snapshot.records.length} URLs inspected)` : 'no URL Inspection snapshot imported'}
- Latest public HTTP check: ${publicCheck ? `${publicCheck.checkedAt} (${publicCheck.records.length} URLs checked${publicCheckCurrent ? '' : '; manifest URL set has since changed or is unverified'})` : 'no public HTTP snapshot recorded'}

A successful live receipt records an API request; a dry-run receipt is only a plan. A matching URL count does not prove identical sitemap contents. Search Console submissions made outside this tool may exist without a local receipt.

## Public sitemap and fetch evidence

${publicCheck ? `- Live sitemap URLs at check time: ${publicCheck.liveSitemap?.urlCount ?? 'unavailable'}
- Repository URLs absent from live sitemap: ${publicCheck.liveSitemap?.repositoryOnlyUrls?.length ?? 'unavailable'}
- Live sitemap URLs absent from repository manifest: ${publicCheck.liveSitemap?.liveOnlyUrls?.length ?? 'unavailable'}
- Priority URLs checked publicly: ${priorityPublicChecked.length} of ${priorityRows.length}
- Priority public fetch issues: ${publicIssues.length}
${publicCheckCurrent ? '' : '- The public check used a different or unverified manifest URL set; rerun it for this manifest.\n'}${publicIssues.map((entry) => `- **${publicByUrl.get(entry.row.url).status}** — ${entry.row.url}: ${publicByUrl.get(entry.row.url).issues.join('; ')}`).join('\n')}` : 'No public fetch check has been recorded. Run `node tools/check-public-indexability.js` for the priority queue.'}

These checks observe a public fetch with a diagnostic user agent, the live robots file, canonical tags, and noindex directives. They do not reproduce Googlebot's crawl or Google's index decision.

## Recorded Google inspection or submission state

| Observed state | URLs |
| --- | ---: |
${statusSummary.map(([status, count]) => `| ${status} | ${count} |`).join('\n') || '| pending_submission | 0 |'}

## URLs requiring follow-up

${pendingRows.length === 0 ? 'All manifest URLs have an indexed observation in the latest snapshot.' : pendingRows.map((row) => `- **${row.displayStatus}** — ${row.url}${row.record?.reason ? ` — ${row.record.reason}` : ''}`).join('\n')}

## Priority URL evidence

The rows below use the queue order. Every listed URL is in the current repository manifest; public and Google observations are shown separately. Compare the Last Google crawl column with the deployment timestamp before treating an inspection as evidence about the new release.

| Group | URL | Public HTTP | Google inspection | Last Google crawl |
| --- | --- | --- | --- | --- |
${priorityRows.map((entry) => `| ${entry.groupLabel} | ${entry.row.url} | ${publicByUrl.get(entry.row.url)?.status || 'not checked'} | ${entry.row.record?.status || 'not inspected'} | ${entry.row.record?.lastCrawledAt || 'unknown'} |`).join('\n')}

## Next action

${!publicCheckCurrent ? 'Run `node tools/check-public-indexability.js` to record current public fetch evidence, then review any issues.' : publicIssues.length > 0 ? 'Review the public fetch issues first, then recheck affected URLs.' : snapshot ? 'Review excluded, not_indexed, and error records in Search Console, fix only evidence-backed issues, then re-inspect affected URLs.' : 'Collect an authorized Search Console URL Inspection export, or run `npm run seo:indexing:inspect -- --priority --live --confirm` with an access token. Public fetches and the sitemap cannot supply Google index status.'}
`;

const reportPath = path.resolve(INDEXING_REPORT_FILE);
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, report, 'utf8');
console.log(`Indexing monitor generated: ${path.relative(process.cwd(), reportPath)}.`);
console.log(`Indexing status summary: ${statusSummary.map(([status, count]) => `${status}=${count}`).join(', ') || 'pending_submission=0'}.`);
