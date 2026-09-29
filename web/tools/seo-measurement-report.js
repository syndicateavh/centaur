#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {
  BACKLINK_SNAPSHOT_FILE,
  MEASUREMENT_DIRECTORY,
  MEASUREMENT_HISTORY_DIRECTORY,
  SEARCH_CONSOLE_PAGE_SNAPSHOT_FILE,
  SEARCH_CONSOLE_QUERY_SNAPSHOT_FILE,
  SEARCH_CONSOLE_SNAPSHOT_FILE,
  validateBacklinkSnapshot,
  validateSearchConsoleSnapshot,
} from '../src/content/seo/measurementSchema.js';
import { validateBacklinkCollection } from '../src/content/seo/backlinkWorkflow.js';
import { KEYWORD_PAGE_ARCHITECTURE, findKeyword } from '../src/content/seo/keywordStrategy.js';
import { REGIONAL_PAGES } from '../src/content/regionalPages.js';

const reportPath = path.resolve(process.env.SEO_MEASUREMENT_REPORT_PATH || `${MEASUREMENT_DIRECTORY}/SEO_MEASUREMENT_REPORT.md`);
const snapshotPaths = [
  { dimension: 'query', filePath: path.resolve(SEARCH_CONSOLE_QUERY_SNAPSHOT_FILE) },
  { dimension: 'page', filePath: path.resolve(SEARCH_CONSOLE_PAGE_SNAPSHOT_FILE) },
  { dimension: null, filePath: path.resolve(SEARCH_CONSOLE_SNAPSHOT_FILE) },
];
const backlinkSnapshotPath = path.resolve(BACKLINK_SNAPSHOT_FILE);
const historyPath = path.resolve(MEASUREMENT_HISTORY_DIRECTORY);
const prospectPath = path.resolve('src/content/seo/backlinkProspects.json');
const failures = [];

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    failures.push(`${path.relative(process.cwd(), filePath)} is not valid JSON: ${error.message}`);
    return null;
  }
}

function loadSnapshot(filePath, validator, label) {
  const snapshot = readJson(filePath);
  if (!snapshot) return null;
  for (const error of validator(snapshot)) failures.push(`${label}: ${error}`);
  return snapshot;
}

function sumKnown(records, field) {
  const values = records.map((record) => record[field]).filter((value) => typeof value === 'number' && Number.isFinite(value));
  return values.length ? values.reduce((total, value) => total + value, 0) : null;
}

function aggregate(records) {
  const clicks = sumKnown(records, 'clicks');
  const impressions = sumKnown(records, 'impressions');
  const positionRows = records.filter((record) => Number.isFinite(record.position) && Number(record.impressions) > 0);
  const positionWeight = positionRows.reduce((total, record) => total + record.impressions, 0);
  const weightedPosition = positionWeight
    ? positionRows.reduce((total, record) => total + record.position * record.impressions, 0) / positionWeight
    : null;
  return {
    clicks,
    impressions,
    ctrPercent: clicks !== null && impressions > 0 ? (clicks / impressions) * 100 : null,
    position: weightedPosition,
  };
}

function display(value, digits = 0) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  return Number(value).toLocaleString('en-IN', { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

function snapshotDays(snapshot) {
  const from = Date.parse(`${snapshot.dateRange.from}T00:00:00Z`);
  const to = Date.parse(`${snapshot.dateRange.to}T00:00:00Z`);
  return Math.round((to - from) / 86_400_000) + 1;
}

function sourceLabel(snapshot) {
  const filters = snapshot.sourceFilters;
  if (!filters) return 'filter provenance unavailable';
  const values = ['property', 'searchType', 'country', 'device', 'filters']
    .map((key) => `${key}=${String(filters[key]).replace(/[|\r\n]/g, ' ')}`);
  const unfiltered = filters.searchType.trim().toLowerCase() === 'web'
    && filters.country.trim().toLowerCase() === 'all'
    && filters.device.trim().toLowerCase() === 'all'
    && filters.filters.trim().toLowerCase() === 'none';
  return `${values.join('; ')} (${unfiltered ? 'recorded as unfiltered Web' : 'scoped or filtered'})`;
}

function sameSourceFilters(left, right) {
  if (!left?.sourceFilters || !right?.sourceFilters) return false;
  return ['property', 'searchType', 'country', 'device', 'filters']
    .every((key) => left.sourceFilters[key] === right.sourceFilters[key]);
}

function precedingWindow(snapshot) {
  const firstDay = Date.parse(`${snapshot.dateRange.from}T00:00:00Z`);
  const days = snapshotDays(snapshot);
  const date = (offset) => new Date(firstDay + offset * 86_400_000).toISOString().slice(0, 10);
  return { from: date(-days), to: date(-1) };
}

function dailyDateCoverage(snapshot) {
  if (snapshot.granularity !== 'daily') return null;
  return new Set(snapshot.records.map((record) => record.date)).size;
}

function loadSearchConsoleSnapshots() {
  const current = [];
  for (const candidate of snapshotPaths) {
    const snapshot = loadSnapshot(candidate.filePath, validateSearchConsoleSnapshot, `Search Console ${candidate.dimension || 'legacy'} snapshot`);
    if (snapshot) {
      const dimension = snapshot.dimension || candidate.dimension || snapshot.records[0]?.dimension;
      if (!candidate.dimension && current.some((entry) => entry.dimension === dimension)) continue;
      current.push({ ...snapshot, dimension });
    }
  }

  const history = [];
  if (fs.existsSync(historyPath)) {
    for (const fileName of fs.readdirSync(historyPath).filter((name) => /^search-console-(query|page)_.*\.json$/i.test(name))) {
      const filePath = path.join(historyPath, fileName);
      const snapshot = loadSnapshot(filePath, validateSearchConsoleSnapshot, `Archived Search Console snapshot ${fileName}`);
      if (snapshot) history.push({ ...snapshot, dimension: snapshot.dimension || fileName.match(/^search-console-(query|page)/i)?.[1] });
    }
  }
  return { current, history };
}

function priorComparison(snapshot, history) {
  const expected = precedingWindow(snapshot);
  const candidates = history.filter((candidate) => (
    candidate.dimension === snapshot.dimension
    && candidate.dateRange.from === expected.from
    && candidate.dateRange.to === expected.to
  ));
  if (candidates.length === 0) {
    return { prior: null, reason: `Import the preceding ${snapshotDays(snapshot)}-day ${snapshot.dimension} window (${expected.from} to ${expected.to}).` };
  }
  const prior = candidates
    .filter((candidate) => sameSourceFilters(snapshot, candidate))
    .sort((left, right) => String(right.importedAt || '').localeCompare(String(left.importedAt || '')))[0];
  if (!prior) return { prior: null, reason: 'The adjacent periods have missing or different property, search type, country, device, or other filter provenance.' };
  if ([snapshot, prior].some((candidate) => dailyDateCoverage(candidate) !== null && dailyDateCoverage(candidate) < snapshotDays(candidate))) {
    return { prior: null, reason: 'At least one daily export has no rows for some dates in its selected window; complete date coverage is required before comparing row totals.' };
  }
  return { prior, reason: null };
}

function priorComparableSnapshot(snapshot, history) {
  return priorComparison(snapshot, history).prior;
}

function summaryTable(snapshots) {
  if (snapshots.length === 0) return '- No Search Console snapshot imported yet. The live baseline is unavailable until an authorized export is supplied.';
  const rows = snapshots.map((snapshot) => {
    const metrics = aggregate(snapshot.records);
    const ageDays = Math.max(0, Math.floor((Date.now() - Date.parse(`${snapshot.dateRange.to}T00:00:00Z`)) / 86_400_000));
    const freshness = ageDays > 45 ? `stale (${ageDays} days)` : `${ageDays} days old`;
    return `| ${snapshot.dimension} | ${snapshot.dateRange.from} to ${snapshot.dateRange.to} | ${snapshot.records.length} | ${display(metrics.clicks)} | ${display(metrics.impressions)} | ${display(metrics.ctrPercent, 2)}% | ${display(metrics.position, 2)} | ${freshness} |`;
  });
  return [
    '| Dimension | Export period | Rows imported | Clicks | Impressions | Weighted CTR | Impression-weighted position | Data age |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |',
    ...rows,
    '',
    ...snapshots.map((snapshot) => `- **${snapshot.dimension} export settings:** ${sourceLabel(snapshot)}. File: ${String(snapshot.sourceFile || 'not recorded').replace(/[|\r\n]/g, ' ')}. Imported ${snapshot.importedAt || 'date unavailable'}.${dailyDateCoverage(snapshot) === null ? '' : ` Dates with rows: ${dailyDateCoverage(snapshot)}/${snapshotDays(snapshot)}.`}`),
    '',
    'Settings are recorded by the importer operator; the CSV itself does not verify them. For a sitewide baseline, use all countries, all devices, and no other filters on the production property.',
  ].join('\n');
}

function trendSection(currentSnapshots, history) {
  if (currentSnapshots.length === 0) return 'No period comparison is available until Search Console data is imported.';
  const lines = [];
  for (const snapshot of currentSnapshots) {
    const { prior, reason } = priorComparison(snapshot, history);
    if (!prior) {
      lines.push(`- **${snapshot.dimension}:** Comparison unavailable. ${reason}`);
      continue;
    }
    const currentMetrics = aggregate(snapshot.records);
    const priorMetrics = aggregate(prior.records);
    const delta = (current, previous) => current === null || previous === null ? 'not available' : `${current - previous >= 0 ? '+' : ''}${display(current - previous)}`;
    lines.push(`- **${snapshot.dimension}:** ${prior.dateRange.from} to ${prior.dateRange.to} → ${snapshot.dateRange.from} to ${snapshot.dateRange.to}; clicks ${delta(currentMetrics.clicks, priorMetrics.clicks)}, impressions ${delta(currentMetrics.impressions, priorMetrics.impressions)}. Settings: ${sourceLabel(snapshot)}. Directional imported-row comparison only; export coverage and anonymized queries can differ.`);
  }
  return lines.join('\n');
}

function dimensionGroups(snapshot) {
  const groups = new Map();
  for (const record of snapshot.records) {
    const key = snapshot.dimension === 'query' ? record.query : record.page;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(record);
  }
  return new Map([...groups].map(([key, records]) => [key, aggregate(records)]));
}

function signedChange(current, prior) {
  if (current === null || prior === null) return 'unavailable';
  const change = current - prior;
  return `${change > 0 ? '+' : ''}${display(change)}`;
}

function changeTable(rows, title, dimension) {
  if (rows.length === 0) return `- No matched ${dimension} rows have a ${title.toLowerCase()} in these exports.`;
  return [
    `**${title}**`,
    '',
    `| ${dimension === 'query' ? 'Query' : 'Page'} | Previous clicks | Current clicks | Click change | Impression change |`,
    '| --- | ---: | ---: | ---: | ---: |',
    ...rows.map((row) => `| ${String(row.key).replace(/[|\r\n]/g, ' ')} | ${display(row.prior.clicks)} | ${display(row.current.clicks)} | ${signedChange(row.current.clicks, row.prior.clicks)} | ${signedChange(row.current.impressions, row.prior.impressions)} |`),
  ].join('\n');
}

function oneSidedTable(keys, groups, title, dimension) {
  if (keys.length === 0) return `- No ${title.toLowerCase()} values in this export pair.`;
  const rows = keys.map((key) => ({ key, metrics: groups.get(key) }))
    .sort((left, right) => (right.metrics.clicks ?? -1) - (left.metrics.clicks ?? -1)
      || (right.metrics.impressions ?? -1) - (left.metrics.impressions ?? -1))
    .slice(0, 10);
  return [
    `**${title} (verify in Search Console)**`,
    '',
    `| ${dimension === 'query' ? 'Query' : 'Page'} | Exported clicks | Exported impressions |`,
    '| --- | ---: | ---: |',
    ...rows.map(({ key, metrics }) => `| ${String(key).replace(/[|\r\n]/g, ' ')} | ${display(metrics.clicks)} | ${display(metrics.impressions)} |`),
  ].join('\n');
}

function dimensionChangeSection(snapshot, history) {
  if (!snapshot) return '- No export imported for this dimension.';
  const { prior, reason } = priorComparison(snapshot, history);
  if (!prior) return `- Comparison unavailable. ${reason}`;
  const currentGroups = dimensionGroups(snapshot);
  const priorGroups = dimensionGroups(prior);
  const matched = [...currentGroups].filter(([key]) => priorGroups.has(key)).map(([key, current]) => ({
    key,
    current,
    prior: priorGroups.get(key),
  }));
  const currentOnly = [...currentGroups.keys()].filter((key) => !priorGroups.has(key));
  const priorOnly = [...priorGroups.keys()].filter((key) => !currentGroups.has(key));
  const clickable = matched.filter(({ current, prior: previous }) => current.clicks !== null && previous.clicks !== null);
  const impressionable = matched.filter(({ current, prior: previous }) => current.impressions !== null && previous.impressions !== null);
  const clickLosses = clickable.filter(({ current, prior: previous }) => current.clicks < previous.clicks)
    .sort((left, right) => (left.current.clicks - left.prior.clicks) - (right.current.clicks - right.prior.clicks)).slice(0, 10);
  const impressionLosses = impressionable.filter(({ current, prior: previous }) => current.impressions < previous.impressions)
    .sort((left, right) => (left.current.impressions - left.prior.impressions) - (right.current.impressions - right.prior.impressions)).slice(0, 10);
  const clickGains = clickable.filter(({ current, prior: previous }) => current.clicks > previous.clicks)
    .sort((left, right) => (right.current.clicks - right.prior.clicks) - (left.current.clicks - left.prior.clicks)).slice(0, 10);
  return [
    `Previous ${prior.dateRange.from} to ${prior.dateRange.to}; current ${snapshot.dateRange.from} to ${snapshot.dateRange.to}. Matched ${matched.length} ${snapshot.dimension} values; ${priorOnly.length} appear only in the earlier export and ${currentOnly.length} only in the current export.`,
    '',
    'Changes below include only values present in both exports. A one-sided row may reflect anonymization, row limits, or a genuinely new or lost query/page; it is not assigned zero or a change. Compare Pages and Queries independently: separate exports cannot identify a page/query pair.',
    '',
    changeTable(clickLosses, 'Largest click declines', snapshot.dimension),
    '',
    changeTable(impressionLosses, 'Largest impression declines', snapshot.dimension),
    '',
    changeTable(clickGains, 'Largest click increases', snapshot.dimension),
    '',
    oneSidedTable(priorOnly, priorGroups, 'Earlier export only', snapshot.dimension),
    '',
    oneSidedTable(currentOnly, currentGroups, 'Current export only', snapshot.dimension),
  ].join('\n');
}

function brandSegmentSection(snapshot, history) {
  if (!snapshot) return '- Brand and non-brand query coverage is unavailable until a Queries export is imported.';
  const brandPattern = /centaur/i;
  const segments = (records) => ({
    brand: aggregate(records.filter((record) => brandPattern.test(record.query))),
    nonbrand: aggregate(records.filter((record) => !brandPattern.test(record.query))),
  });
  const current = segments(snapshot.records);
  const { prior, reason } = priorComparison(snapshot, history);
  const previous = prior ? segments(prior.records) : null;
  return [
    'A query containing “centaur” is classified as brand-containing; every other exported query is classified as non-brand. This is a conservative string grouping, not a claim that all omitted or ambiguous queries have been classified.',
    '',
    previous ? `Previous ${prior.dateRange.from} to ${prior.dateRange.to}; current ${snapshot.dateRange.from} to ${snapshot.dateRange.to}.` : `Current ${snapshot.dateRange.from} to ${snapshot.dateRange.to}. Comparison unavailable: ${reason}`,
    '',
    '| Exported query group | Previous clicks | Current clicks | Click change | Previous impressions | Current impressions | Impression change |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: |',
    ...[['brand', 'Brand-containing'], ['nonbrand', 'Non-brand']].map(([key, label]) => `| ${label} | ${previous ? display(previous[key].clicks) : 'unavailable'} | ${display(current[key].clicks)} | ${previous ? signedChange(current[key].clicks, previous[key].clicks) : 'unavailable'} | ${previous ? display(previous[key].impressions) : 'unavailable'} | ${display(current[key].impressions)} | ${previous ? signedChange(current[key].impressions, previous[key].impressions) : 'unavailable'} |`),
  ].join('\n');
}

function targetPerformanceTable(snapshots) {
  const querySnapshot = snapshots.find((snapshot) => snapshot.dimension === 'query');
  const pageSnapshot = snapshots.find((snapshot) => snapshot.dimension === 'page');
  if (!querySnapshot && !pageSnapshot) return '- No target-page performance data imported yet.';
  if (querySnapshot && pageSnapshot && (
    querySnapshot.dateRange.from !== pageSnapshot.dateRange.from
    || querySnapshot.dateRange.to !== pageSnapshot.dateRange.to
    || !sameSourceFilters(querySnapshot, pageSnapshot)
  )) return '- Query and Page exports use different dates or recorded filters. Import aligned exports before comparing keyword owners.';

  const grouped = new Map(KEYWORD_PAGE_ARCHITECTURE.map((page) => [page.targetUrl, { page: [], query: [] }]));
  for (const record of pageSnapshot?.records || []) {
    const group = grouped.get(record.page);
    if (group) group.page.push(record);
  }
  for (const record of querySnapshot?.records || []) {
    const match = findKeyword(record.query);
    const group = match ? grouped.get(match.targetUrl) : null;
    if (group) group.query.push(record);
  }

  const rows = KEYWORD_PAGE_ARCHITECTURE.map((page) => {
    const metrics = grouped.get(page.targetUrl);
    const pageStats = aggregate(metrics.page);
    const queryStats = aggregate(metrics.query);
    const pageClicks = metrics.page.length ? display(pageStats.clicks) : 'no page row';
    const pageImpressions = metrics.page.length ? display(pageStats.impressions) : 'no page row';
    const queryClicks = metrics.query.length ? display(queryStats.clicks) : 'no exact strategy-query row';
    const queryImpressions = metrics.query.length ? display(queryStats.impressions) : 'no exact strategy-query row';
    return `| ${page.targetUrl} | ${pageClicks} | ${pageImpressions} | ${queryClicks} | ${queryImpressions} |`;
  });
  return [
    'Query matches below are exact approved strategy phrases only. Query metrics are sitewide, and the owner mapping is editorial; these rows do not prove that the mapped page received impressions for that query. A page-filtered Queries export or Search Console API page×query data is required for that diagnosis. Search Console may omit anonymized or low-volume queries; “no row” is not evidence of zero traffic.',
    '',
    '| Approved page owner | Page clicks | Page impressions | Exact strategy-query clicks | Exact strategy-query impressions |',
    '| --- | ---: | ---: | ---: | ---: |',
    ...rows,
  ].join('\n');
}

function regionalPerformanceTable(pageSnapshot, history) {
  if (!pageSnapshot) return '- Regional performance is unavailable until a Search Console Pages export is imported.';
  const prior = priorComparableSnapshot(pageSnapshot, history);
  if (!prior) return '- Regional period comparison is unavailable until an earlier, equal-length Pages export is imported.';

  const metricsFor = (snapshot, pagePath) => {
    const rows = snapshot.records.filter((record) => record.page === pagePath);
    return rows.length ? aggregate(rows) : null;
  };
  const difference = (current, previous) => {
    if (current === null || previous === null) return 'unavailable';
    const value = current - previous;
    return `${value > 0 ? '+' : ''}${display(value)}`;
  };
  const rows = REGIONAL_PAGES.map((page) => {
    const current = metricsFor(pageSnapshot, page.path);
    const previous = metricsFor(prior, page.path);
    const status = !current || !previous || current.clicks === null || previous.clicks === null
      ? 'Incomplete export evidence; inspect URL in Search Console'
      : current.clicks < previous.clicks
        ? 'Click loss; inspect page-filtered queries and indexing'
        : 'No click loss in imported rows';
    return `| ${page.regionName} | ${current ? display(current.clicks) : 'unavailable'} | ${previous ? display(previous.clicks) : 'unavailable'} | ${difference(current?.clicks ?? null, previous?.clicks ?? null)} | ${difference(current?.impressions ?? null, previous?.impressions ?? null)} | ${current ? `${display(current.ctrPercent, 2)}%` : 'unavailable'} | ${current ? display(current.position, 2) : 'unavailable'} | ${status} |`;
  });
  return [
    `Current: ${pageSnapshot.dateRange.from} to ${pageSnapshot.dateRange.to}; previous: ${prior.dateRange.from} to ${prior.dateRange.to}. A missing row is not zero. Page totals alone cannot establish the cause of a loss.`,
    '',
    '| Region | Current clicks | Previous clicks | Click change | Impression change | Current CTR | Current position | Review state |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |',
    ...rows,
  ].join('\n');
}

function opportunityReview(snapshot) {
  if (!snapshot) return '- Page-level opportunities unavailable; import a Search Console page export first.';
  const candidates = [...dimensionGroups(snapshot)].map(([page, metrics]) => ({ page, ...metrics }))
    .filter((record) => (
      Number(record.impressions) >= 100
      && Number.isFinite(record.position)
      && record.position <= 10
      && Number.isFinite(record.ctrPercent)
      && record.ctrPercent < 2
    ))
    .sort((left, right) => right.impressions - left.impressions)
    .slice(0, 15);
  if (candidates.length === 0) return '- No rows meet the triage flag (at least 100 impressions, average position 10 or better, CTR below 2%) in this export.';
  return [
    'These are manual review flags, not automatic rewrite instructions. Check country, device, query mix, branded demand, SERP features, and snippet accuracy before changing a page.',
    '',
    '| Page | Impressions | CTR | Avg. position | Review prompt |',
    '| --- | ---: | ---: | ---: | --- |',
    ...candidates.map((record) => `| ${record.page} | ${display(record.impressions)} | ${display(record.ctrPercent, 2)}% | ${display(record.position, 2)} | Check query mix and title/description promise |`),
  ].join('\n');
}

const { current: searchSnapshots, history: searchHistory } = loadSearchConsoleSnapshots();
const backlinkSnapshot = loadSnapshot(backlinkSnapshotPath, validateBacklinkSnapshot, 'Backlink audit snapshot');
const prospects = readJson(prospectPath) || [];
const prospectValidation = validateBacklinkCollection(prospects);
for (const error of prospectValidation.errors) failures.push(`Prospect registry: ${error}`);

if (failures.length > 0) {
  console.error(`Measurement report cannot be generated:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

const statusCounts = prospects.reduce((counts, record) => ({ ...counts, [record.status]: (counts[record.status] || 0) + 1 }), {});
const backlinkRecords = backlinkSnapshot?.records || [];
const archivedBacklinkCount = fs.existsSync(historyPath)
  ? fs.readdirSync(historyPath).filter((name) => /^backlinks_.*\.json$/i.test(name)).length
  : 0;
const querySnapshot = searchSnapshots.find((snapshot) => snapshot.dimension === 'query');
const pageSnapshot = searchSnapshots.find((snapshot) => snapshot.dimension === 'page');
const crossDimensionStatus = !querySnapshot || !pageSnapshot
  ? 'Both Queries and Pages exports are required for a complete two-dimensional review.'
  : querySnapshot.dateRange.from === pageSnapshot.dateRange.from
    && querySnapshot.dateRange.to === pageSnapshot.dateRange.to
    && sameSourceFilters(querySnapshot, pageSnapshot)
    ? 'Queries and Pages use the same recorded dates and Search Console settings. Their totals remain separate and must not be added together.'
    : 'Queries and Pages have different dates or recorded filters; do not combine their findings.';
const report = `# SEO Measurement Report

Generated: ${new Date().toISOString()}

This report contains only imported or repository-recorded evidence. Missing imports and missing rows are not treated as zero. Search Console exports may be incomplete because of anonymized queries, selected dimensions, and export row limits. This report does not claim indexing, rankings, leads, or backlink gains.

## Data readiness and performance

${summaryTable(searchSnapshots)}

CTR and position are impression-weighted from imported rows, not unweighted row averages. Totals describe only the rows in each export, not necessarily the full Search Console property.

## Period-over-period check

${trendSection(searchSnapshots, searchHistory)}

Comparisons use only the immediately preceding archived snapshot of the same dimension, equal date-window length, and identical recorded settings. ${crossDimensionStatus}

## Brand and non-brand queries

${brandSegmentSection(querySnapshot, searchHistory)}

## Changed pages

${dimensionChangeSection(pageSnapshot, searchHistory)}

## Changed queries

${dimensionChangeSection(querySnapshot, searchHistory)}

## Approved keyword-page owners

${targetPerformanceTable(searchSnapshots)}

## Regional guide comparison

${regionalPerformanceTable(pageSnapshot, searchHistory)}

## Manual page-review flags

${opportunityReview(pageSnapshot)}

## Backlink audit

${backlinkSnapshot
    ? `- Latest imported audit rows: ${backlinkRecords.length}\n- Prior audit snapshots archived locally: ${archivedBacklinkCount}\n- Rows marked earned/monitoring: ${backlinkRecords.filter((record) => ['earned', 'monitoring'].includes(record.status)).length}`
    : '- No backlink audit snapshot imported yet. Import a current CSV only after downloading it from an authorized audit account.'}

## Outreach registry

- Prospect records: ${prospects.length}
- Status counts: ${Object.entries(statusCounts).map(([status, count]) => `${status}=${count}`).join(', ') || 'none'}
- No backlink is marked earned without a source URL and manual public verification.
- Outreach is manual and relevance-led; the registry does not create, submit, or guarantee links.

## Monthly maintenance actions

1. Export Query and Page tables from Google Search Console for the same completed 28-day window; include the preceding matching 28-day window for trend comparison.
2. Import both dimensions and regenerate this report. Review data freshness, query/page owner coverage, gains/losses, and manual page-review flags. For a shortlisted page, export page-filtered Queries and a device split for both windows, or obtain equivalent Search Console API data; separate sitewide Query and Page tables cannot reveal page×query pairs.
3. Check Search Console indexing/Page Indexing and sitemap status in the authorized account; the local build cannot observe Google's crawl or indexing state.
4. Review organic landing-page enquiries separately in GA4/CRM. A lead CTA click is not a completed or qualified lead; never infer outcomes from click events.
5. Prioritize a page change only after checking live query/SERP intent, current facts and curriculum, and the canonical page owner. Record the source, date, change, and validation; preserve the one-course/module distinction.
6. Run the build, lint, SEO, and deployment checks after approved page changes. Re-export after the next full reporting window.

## Evidence still required

- Google Search Console account access or authorized Query and Page CSV exports for the production property.
- Google Analytics/CRM aggregate landing-page enquiry outcomes if lead quality is to be measured. The repository does not contain a live GA4 property export.
- A fresh backlink audit export from an authorized provider account; the prospect registry is not an earned-link report.
`;

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, report, 'utf8');
console.log(`SEO measurement report written to ${path.relative(process.cwd(), reportPath)}.`);
