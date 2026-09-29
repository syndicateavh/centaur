#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {
  MEASUREMENT_HISTORY_DIRECTORY,
  SEARCH_CONSOLE_SNAPSHOT_FILES,
  validateSearchConsoleSnapshot,
} from '../src/content/seo/measurementSchema.js';

const manifestPath = path.resolve(process.env.RELEASE_MANIFEST_PATH || 'RELEASE_MANIFEST.json');
const measurementPath = path.resolve(process.env.SEO_MEASUREMENT_REPORT_PATH || 'src/content/seo/measurements/SEO_MEASUREMENT_REPORT.md');
const outputPath = path.resolve(process.env.RELEASE_LEARNING_REPORT_PATH || 'RELEASE_LEARNING_REPORT.md');

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Release manifest is missing: ${path.relative(process.cwd(), filePath)}`);
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new Error(`Release manifest is not valid JSON: ${error.message}`);
  }
}

function readMeasurementReport() {
  if (!fs.existsSync(measurementPath)) return '';
  return fs.readFileSync(measurementPath, 'utf8');
}

function displayPath(filePath) {
  return path.relative(process.cwd(), filePath).split(path.sep).join('/');
}

function evidenceState(report, readyPattern, missingPattern) {
  if (!report) return { state: 'unavailable', detail: `Missing ${displayPath(measurementPath)}.` };
  if (missingPattern.test(report)) return { state: 'pending', detail: 'The required authorized export has not been imported.' };
  if (readyPattern && readyPattern.test(report)) return { state: 'ready', detail: 'The report contains the required imported evidence.' };
  return { state: 'pending', detail: 'The report does not contain a complete comparison for this measure.' };
}

function readValidSnapshot(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    const snapshot = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return validateSearchConsoleSnapshot(snapshot).length ? null : snapshot;
  } catch {
    return null;
  }
}

function snapshotDays(snapshot) {
  return Math.round((Date.parse(`${snapshot.dateRange.to}T00:00:00Z`) - Date.parse(`${snapshot.dateRange.from}T00:00:00Z`)) / 86_400_000) + 1;
}

function sameRange(left, right) {
  return left?.dateRange.from === right?.dateRange.from && left?.dateRange.to === right?.dateRange.to;
}

function sameFilters(snapshots) {
  const filters = snapshots.map((snapshot) => snapshot?.sourceFilters);
  return filters.every((filter) => filter && ['property', 'searchType', 'country', 'device', 'filters'].every((key) => filter[key] === filters[0][key]));
}

function priorRange(snapshot) {
  const from = Date.parse(`${snapshot.dateRange.from}T00:00:00Z`);
  const date = (offset) => new Date(from + offset * 86_400_000).toISOString().slice(0, 10);
  return { from: date(-28), to: date(-1) };
}

function searchConsoleEvidence() {
  const currentQuery = readValidSnapshot(path.resolve(SEARCH_CONSOLE_SNAPSHOT_FILES.query));
  const currentPage = readValidSnapshot(path.resolve(SEARCH_CONSOLE_SNAPSHOT_FILES.page));
  if (!currentQuery || !currentPage || currentQuery.dimension !== 'query' || currentPage.dimension !== 'page') {
    return {
      current: { state: 'pending', detail: 'Valid current Queries and Pages snapshots are both required.' },
      comparison: { state: 'pending', detail: 'Two comparable 28-day windows are not available.' },
    };
  }
  if (!sameRange(currentQuery, currentPage) || snapshotDays(currentQuery) !== 28 || currentQuery.dateRange.to >= new Date().toISOString().slice(0, 10)) {
    return {
      current: { state: 'pending', detail: 'Current Queries and Pages must cover the same completed 28-day window.' },
      comparison: { state: 'pending', detail: 'The current window is not a matched, completed 28-day pair.' },
    };
  }
  const current = { state: 'ready', detail: `Both dimensions cover ${currentQuery.dateRange.from} to ${currentQuery.dateRange.to}; CSV row totals can omit anonymized queries.` };
  const historyPath = path.resolve(MEASUREMENT_HISTORY_DIRECTORY);
  const expected = priorRange(currentQuery);
  const prior = { query: null, page: null };
  if (fs.existsSync(historyPath)) {
    for (const name of fs.readdirSync(historyPath)) {
      const dimension = name.match(/^search-console-(query|page)_.*\.json$/i)?.[1]?.toLowerCase();
      if (!dimension) continue;
      const snapshot = readValidSnapshot(path.join(historyPath, name));
      if (snapshot?.dimension === dimension && snapshot.dateRange.from === expected.from && snapshot.dateRange.to === expected.to) prior[dimension] = snapshot;
    }
  }
  if (!prior.query || !prior.page) {
    return { current, comparison: { state: 'pending', detail: `Missing prior Queries and/or Pages for ${expected.from} to ${expected.to}.` } };
  }
  if (!sameFilters([currentQuery, currentPage, prior.query, prior.page])) {
    return { current, comparison: { state: 'pending', detail: 'Property, search type, country, device, and other filters must be recorded and identical across all four imports.' } };
  }
  return { current, comparison: { state: 'ready', detail: `Both dimensions have adjacent completed 28-day windows (${expected.from} to ${expected.to}; ${currentQuery.dateRange.from} to ${currentQuery.dateRange.to}) with matching recorded filters.` } };
}

function renderStatus(state) {
  if (state === 'ready') return 'Ready';
  if (state === 'passed') return 'Passed';
  if (state === 'unavailable') return 'Unavailable';
  return 'Pending';
}

try {
  const manifest = readJson(manifestPath);
  const measurement = readMeasurementReport();
  const gscEvidence = searchConsoleEvidence();
  const localRelease = manifest.status === 'local-qa-passed' && manifest.releaseReadyForUpload === true;
  const externalStatus = manifest.externalVerification?.status || 'not-run';
  const searchConsole = gscEvidence.current;
  const periodComparison = gscEvidence.comparison;
  const pageReview = evidenceState(
    measurement,
    /No rows meet the triage flag|\| Page \| Impressions \|/i,
    /Page-level opportunities unavailable; import a Search Console page export first/i,
  );
  const regionalComparison = periodComparison.state === 'ready'
    ? evidenceState(measurement, /\| Region \| Current clicks \| Previous clicks \|/i, /Regional performance is unavailable until a Search Console Pages export is imported/i)
    : { state: 'pending', detail: 'Comparable page snapshots are required before prioritizing the five regional guides.' };
  const qualifiedEnquiries = {
    state: 'pending',
    detail: 'Import an authorized GA4/CRM landing-page report; CTA clicks are contact intent, not confirmed enquiries.',
  };

  const nextActions = [];
  if (!localRelease) nextActions.push('Resolve the failed local release gate before uploading any files.');
  if (externalStatus !== 'passed') nextActions.push('Complete the outstanding Phase 2 accounting and Phase 3 case expert reviews before publication; after approval, upload the contents of build/client/, clear the cache, then run npm run seo:external -- https://centaurcareers.in.');
  if (searchConsole.state !== 'ready') nextActions.push('Import Queries and Pages exports for two equal completed 28-day windows with the same Search Console filters.');
  if (periodComparison.state !== 'ready') nextActions.push('Import the older matching period first, then the newer period with identical --property, --search-type, --country, --device, and --filters values; regenerate the measurement report.');
  nextActions.push('For a shortlisted URL, export Queries with that exact Page filter for both windows; separate sitewide Queries and Pages exports cannot identify a URL/query pair.');
  if (qualifiedEnquiries.state !== 'ready') nextActions.push('Export organic landing-page confirmed enquiries from GA4/CRM for the same windows.');
  if (nextActions.length === 0) nextActions.push('Review page/query losses and qualified-enquiry changes, then record a keep, revise, or stop decision for each edited owner.');

  const report = `# Release and Learning Handoff

Generated: ${new Date().toISOString()}

This handoff combines the repository release result with the available post-release evidence. It never treats missing exports, missing rows, rankings, or CTA clicks as confirmed performance.

## Release status

| Check | Status | Evidence |
| --- | --- | --- |
| Local technical release package | ${renderStatus(localRelease ? 'passed' : 'pending')} | ${manifest.status || 'Unknown'}; ${manifest.package?.fileCount ?? 'unknown'} files; ${manifest.indexableRouteCount ?? 'unknown'} indexable routes; ${manifest.sitemapUrlCount ?? 'unknown'} sitemap URLs. Expert editorial approval is separate. |
| External deployed-site verification | ${renderStatus(externalStatus === 'passed' ? 'passed' : externalStatus === 'not-run' ? 'pending' : 'unavailable')} | ${externalStatus === 'passed' ? 'The configured external origin passed the live route check.' : 'Not verified. A local build cannot prove the deployed host is serving this package.'} |
| Measurement report | ${renderStatus(measurement ? 'ready' : 'unavailable')} | ${measurement ? displayPath(measurementPath) : 'No generated measurement report.'} |

The upload boundary is the **contents** of \`build/client/\`, including \`.htaccess\`. Do not upload the repository or a nested \`build/client/\` directory.

## Learning evidence

| Evidence | Status | Interpretation |
| --- | --- | --- |
| Search Console Queries and Pages | ${renderStatus(searchConsole.state)} | ${searchConsole.detail} |
| Equal-window period comparison | ${renderStatus(periodComparison.state)} | ${periodComparison.detail} |
| Page-level opportunity review | ${renderStatus(pageReview.state)} | ${pageReview.detail} |
| Five regional guide comparison | ${renderStatus(regionalComparison.state)} | ${regionalComparison.detail} |
| Confirmed organic enquiries | ${renderStatus(qualifiedEnquiries.state)} | ${qualifiedEnquiries.detail} |

Until both Search Console periods, page-filtered queries for the candidate URL, and the matching GA4/CRM enquiry report are available, content decisions remain **pending evidence**. The supplied GA4 page-view or AI-assistant screenshots cannot establish organic landing pages or confirmed enquiries. Import filter fields are an operator record of the Search Console UI settings, not independently verified by the CSV.

## Decision rules for released changes

| Evidence after an equal completed window | Decision | Required check |
| --- | --- | --- |
| Relevant impressions/clicks and qualified enquiries improve without a quality or indexing regression | Keep | Preserve the canonical owner and continue the next measurement window. |
| Impressions exist but CTR, position, landing-page engagement, or qualified enquiries are weak | Revise | Inspect query mix, SERP features, snippet promise, intent match, and current facts before editing. |
| Two comparable windows show no relevant demand or conversion and the page overlaps another owner | Stop or consolidate | Check indexing, seasonality, internal links, and inbound links first; record the canonical owner before removal. |
| Evidence is missing, mismatched, or filtered differently | Hold | Do not infer zero traffic or create another page from an incomplete export. |

## Next actions

${nextActions.map((action, index) => `${index + 1}. ${action}`).join('\n')}

## Source artifacts

- Release manifest: \`${path.relative(process.cwd(), manifestPath)}\`
- Release QA report: \`RELEASE_QA_REPORT.md\`
- Measurement report: \`${displayPath(measurementPath)}\`
- Measurement runbook: \`docs/SEO_MEASUREMENT_AND_MAINTENANCE.md\`

This report records readiness and evidence boundaries. It does not claim that Google, ChatGPT, Gemini, Claude, or any other service has indexed, cited, or recommended the site.
`;

fs.writeFileSync(outputPath, report, 'utf8');
console.log(`Release and learning handoff written to ${path.relative(process.cwd(), outputPath)}.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Release and learning handoff failed');
  process.exit(1);
}
