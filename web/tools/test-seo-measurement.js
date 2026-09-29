#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'centaur-seo-measurement-test-'));
const measurementDirectory = path.join(temporaryRoot, 'measurements');
const reportFile = path.join(temporaryRoot, 'measurement-report.md');
const importerPath = path.join(repositoryRoot, 'tools', 'import-search-console.js');
const backlinkImporterPath = path.join(repositoryRoot, 'tools', 'import-backlink-audit.js');
const reportToolPath = path.join(repositoryRoot, 'tools', 'seo-measurement-report.js');
const releaseLearnPath = path.join(repositoryRoot, 'tools', 'release-learn.js');
const sourceContext = ['--property', 'sc-domain:centaurcareers.in', '--search-type', 'web', '--country', 'IND', '--device', 'all', '--filters', 'none'];

function runNode(scriptPath, args, extraEnv = {}) {
  return spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    env: { ...process.env, SEO_MEASUREMENT_DATA_DIR: measurementDirectory, ...extraEnv },
  });
}

function writeCsv(name, value) {
  const filePath = path.join(temporaryRoot, name);
  fs.writeFileSync(filePath, value, 'utf8');
  return filePath;
}

function importCsv(name, csv, from, to, context = sourceContext) {
  const input = writeCsv(name, csv);
  const args = [input];
  if (from && to) args.push('--from', from, '--to', to);
  args.push(...context);
  return runNode(importerPath, args);
}

function snapshot(name) {
  return JSON.parse(fs.readFileSync(path.join(measurementDirectory, name), 'utf8'));
}

try {
  const noPeriod = importCsv('no-period.csv', 'Top queries,Clicks,Impressions,CTR,Position\n"investment banking operations course",5,100,5%,8.2\n', null, null);
  assert.notEqual(noPeriod.status, 0, 'period exports without a Date column must require an explicit date range');

  const olderQueryImport = importCsv(
    'older-query-export.csv',
    'Top queries,Clicks,Impressions,CTR,Position\n"investment banking operations course",5,100,5%,8.2\n',
    '2026-07-01',
    '2026-07-28',
  );
  assert.equal(olderQueryImport.status, 0, olderQueryImport.stderr);
  assert.equal(snapshot('search-console-query.json').granularity, 'period');
  assert.equal(snapshot('search-console-query.json').records[0].date, null);
  assert.equal(snapshot('search-console-query.json').sourceFilters.country, 'IND');

  const newerQueryImport = importCsv(
    'newer-query-export.csv',
    'Top queries,Clicks,Impressions,CTR,Position\n"investment banking operations course",10,250,4%,7.1\n',
    '2026-07-29',
    '2026-08-25',
  );
  assert.equal(newerQueryImport.status, 0, newerQueryImport.stderr);
  const archivedQueries = fs.readdirSync(path.join(measurementDirectory, 'history')).filter((name) => name.startsWith('search-console-query_'));
  assert.equal(archivedQueries.length, 1, 'replacing a query-period snapshot must archive the previous period');

  const olderPageImport = importCsv(
    'older-page-export.csv',
    'Top pages,Clicks,Impressions,CTR,Position\nhttps://centaurcareers.in/india/pune/,5,200,2.5%,8.1\n',
    '2026-07-01',
    '2026-07-28',
  );
  assert.equal(olderPageImport.status, 0, olderPageImport.stderr);

  const pageImport = importCsv(
    'page-export.csv',
    'Top pages,Clicks,Impressions,CTR,Position\nhttps://www.centaurcareers.in/courses/fintech,1,250,0.4%,4.2\nhttps://centaurcareers.in/india/pune/,0,250,,\n',
    '2026-07-29',
    '2026-08-25',
  );
  assert.equal(pageImport.status, 0, pageImport.stderr);
  assert.equal(snapshot('search-console-page.json').records[0].page, '/courses/fintech/');
  assert.equal(snapshot('search-console-query.json').dateRange.from, '2026-07-29', 'page imports must not overwrite query data');

  const beforeRejectedImport = fs.readFileSync(path.join(measurementDirectory, 'search-console-page.json'), 'utf8');
  const invalidPage = importCsv(
    'external-page-export.csv',
    'Top pages,Clicks,Impressions,CTR,Position\nhttps://example.org/page,1,250,0.4%,4.2\n',
    '2026-07-29',
    '2026-08-25',
  );
  assert.notEqual(invalidPage.status, 0, 'page exports from outside the configured production site must be rejected');
  assert.equal(fs.readFileSync(path.join(measurementDirectory, 'search-console-page.json'), 'utf8'), beforeRejectedImport, 'rejected imports must not modify the latest snapshot');

  const backlinkCsv = writeCsv(
    'backlink-audit.csv',
    'Source URL,Target URL/Path,Status,Last Checked,Anchor Text,Rel\nhttps://finance.example.org/article,https://www.centaurcareers.in/courses/fintech,candidate,2026-08-25,FinTech module guide,follow\n',
  );
  const backlinkImport = runNode(backlinkImporterPath, [backlinkCsv]);
  assert.equal(backlinkImport.status, 0, backlinkImport.stderr);
  const backlinkSnapshot = JSON.parse(fs.readFileSync(path.join(measurementDirectory, 'backlinks.json'), 'utf8'));
  assert.equal(backlinkSnapshot.records[0].targetPath, '/courses/fintech/');
  const externalBacklinkCsv = writeCsv(
    'external-backlink-target.csv',
    'Source URL,Target URL/Path,Status\nhttps://finance.example.org/article,https://example.org/courses/fintech,candidate\n',
  );
  const invalidBacklinkImport = runNode(backlinkImporterPath, [externalBacklinkCsv]);
  assert.notEqual(invalidBacklinkImport.status, 0, 'backlink audit targets outside the configured site must be rejected');
  assert.equal(fs.readFileSync(path.join(measurementDirectory, 'backlinks.json'), 'utf8'), JSON.stringify(backlinkSnapshot, null, 2) + '\n', 'rejected backlink imports must not modify the latest snapshot');

  const reportResult = runNode(reportToolPath, [], { SEO_MEASUREMENT_REPORT_PATH: reportFile });
  assert.equal(reportResult.status, 0, reportResult.stderr);
  const report = fs.readFileSync(reportFile, 'utf8');
  assert.match(report, /2026-07-01 to 2026-07-28/);
  assert.match(report, /clicks \+5, impressions \+150/);
  assert.match(report, /\/courses\/fintech\//);
  assert.match(report, /Manual page-review flags/);
  assert.match(report, /Regional guide comparison/);
  assert.match(report, /\| Pune \| 0 \| 5 \| -5 \| \+50 \|/);
  assert.match(report, /no row.*not evidence of zero traffic/i);
  const reviewQueue = report.split('## Manual page-review flags')[1]?.split('## Backlink audit')[0] || '';
  assert.match(reviewQueue, /\/courses\/fintech\//);
  assert.doesNotMatch(reviewQueue, /\/india\/pune\//, 'missing CTR/position values must not be treated as zero or rank 0');

  const releaseManifest = path.join(temporaryRoot, 'release-manifest.json');
  const releaseReport = path.join(temporaryRoot, 'release-learning.md');
  fs.writeFileSync(releaseManifest, JSON.stringify({ status: 'local-qa-passed', releaseReadyForUpload: true, externalVerification: { status: 'not-run' } }), 'utf8');
  const releaseEnvironment = { RELEASE_MANIFEST_PATH: releaseManifest, SEO_MEASUREMENT_REPORT_PATH: reportFile, RELEASE_LEARNING_REPORT_PATH: releaseReport };
  const readyHandoff = runNode(releaseLearnPath, [], releaseEnvironment);
  assert.equal(readyHandoff.status, 0, readyHandoff.stderr);
  assert.match(fs.readFileSync(releaseReport, 'utf8'), /Equal-window period comparison \| Ready/);
  const pageSnapshot = snapshot('search-console-page.json');
  pageSnapshot.sourceFilters.country = 'USA';
  fs.writeFileSync(path.join(measurementDirectory, 'search-console-page.json'), JSON.stringify(pageSnapshot), 'utf8');
  const mismatchedHandoff = runNode(releaseLearnPath, [], releaseEnvironment);
  assert.equal(mismatchedHandoff.status, 0, mismatchedHandoff.stderr);
  assert.match(fs.readFileSync(releaseReport, 'utf8'), /Equal-window period comparison \| Pending/);
  assert.match(fs.readFileSync(releaseReport, 'utf8'), /filters must be recorded and identical/);

  const priorQueryForDrop = importCsv(
    'drop-prior-queries.csv',
    'Top queries,Clicks,Impressions,CTR,Position\ncentaur careers,8,100,8%,2\nfinance course fees,10,200,5%,5\ngone query,1,50,2%,9\n',
    '2026-08-01',
    '2026-08-28',
  );
  assert.equal(priorQueryForDrop.status, 0, priorQueryForDrop.stderr);
  const currentQueryForDrop = importCsv(
    'drop-current-queries.csv',
    'Top queries,Clicks,Impressions,CTR,Position\ncentaur careers,2,80,2.5%,3\nfinance course fees,4,120,3.3%,6\nnew query,3,70,4.3%,8\n',
    '2026-08-29',
    '2026-09-25',
  );
  assert.equal(currentQueryForDrop.status, 0, currentQueryForDrop.stderr);
  const priorPageForDrop = importCsv(
    'drop-prior-pages.csv',
    'Top pages,Clicks,Impressions,CTR,Position\nhttps://centaurcareers.in/india/pune/,8,200,4%,5\nhttps://centaurcareers.in/courses/,5,100,5%,4\nhttps://centaurcareers.in/old-page/,1,30,3.3%,8\n',
    '2026-08-01',
    '2026-08-28',
  );
  assert.equal(priorPageForDrop.status, 0, priorPageForDrop.stderr);
  const currentPageForDrop = importCsv(
    'drop-current-pages.csv',
    'Top pages,Clicks,Impressions,CTR,Position\nhttps://centaurcareers.in/india/pune/,2,130,1.5%,6\nhttps://centaurcareers.in/courses/,7,120,5.8%,4\nhttps://centaurcareers.in/new-page/,1,30,3.3%,8\n',
    '2026-08-29',
    '2026-09-25',
  );
  assert.equal(currentPageForDrop.status, 0, currentPageForDrop.stderr);
  assert.equal(runNode(reportToolPath, [], { SEO_MEASUREMENT_REPORT_PATH: reportFile }).status, 0);
  const dropReport = fs.readFileSync(reportFile, 'utf8');
  assert.match(dropReport, /## Brand and non-brand queries[\s\S]*?\| Brand-containing \| 8 \| 2 \| -6 \| 100 \| 80 \| -20 \|/);
  assert.match(dropReport, /## Changed pages[\s\S]*?\| \/india\/pune\/ \| 8 \| 2 \| -6 \| -70 \|/);
  assert.match(dropReport, /## Changed queries[\s\S]*?\| finance course fees \| 10 \| 4 \| -6 \| -80 \|/);
  assert.match(dropReport, /1 appear only in the earlier export and 1 only in the current export/);
  assert.match(dropReport, /one-sided row.*not assigned zero/i);
  assert.match(dropReport, /country=IND; device=all; filters=none \(scoped or filtered\)/);
  assert.match(dropReport, /drop-current-pages\.csv/);

  const archiveBeforeChangedFilters = fs.readdirSync(path.join(measurementDirectory, 'history')).filter((name) => name.startsWith('search-console-page_')).length;
  const changedFilterImport = importCsv(
    'same-period-different-filter.csv',
    'Top pages,Clicks,Impressions,CTR,Position\nhttps://centaurcareers.in/india/pune/,4,100,4%,5\n',
    '2026-08-29',
    '2026-09-25',
    ['--property', 'sc-domain:centaurcareers.in', '--search-type', 'web', '--country', 'USA', '--device', 'all', '--filters', 'none'],
  );
  assert.equal(changedFilterImport.status, 0, changedFilterImport.stderr);
  const archiveAfterChangedFilters = fs.readdirSync(path.join(measurementDirectory, 'history')).filter((name) => name.startsWith('search-console-page_')).length;
  assert.equal(archiveAfterChangedFilters, archiveBeforeChangedFilters + 1, 'same-date import with different filters must preserve the prior snapshot');
  assert.equal(runNode(reportToolPath, [], { SEO_MEASUREMENT_REPORT_PATH: reportFile }).status, 0);
  const mismatchedReport = fs.readFileSync(reportFile, 'utf8');
  assert.match(mismatchedReport, /## Changed pages\s+- Comparison unavailable\. The adjacent periods have missing or different property/);
  assert.match(mismatchedReport, /Queries and Pages have different dates or recorded filters/);

  const incompletePriorDaily = importCsv(
    'incomplete-prior-daily.csv',
    'Date,Top queries,Clicks,Impressions,CTR,Position\n2026-09-01,centaur careers,2,30,6.7%,3\n',
    '2026-09-01',
    '2026-09-07',
  );
  assert.equal(incompletePriorDaily.status, 0, incompletePriorDaily.stderr);
  const incompleteCurrentDaily = importCsv(
    'incomplete-current-daily.csv',
    'Date,Top queries,Clicks,Impressions,CTR,Position\n2026-09-08,centaur careers,1,20,5%,4\n',
    '2026-09-08',
    '2026-09-14',
  );
  assert.equal(incompleteCurrentDaily.status, 0, incompleteCurrentDaily.stderr);
  assert.equal(runNode(reportToolPath, [], { SEO_MEASUREMENT_REPORT_PATH: reportFile }).status, 0);
  const incompleteReport = fs.readFileSync(reportFile, 'utf8');
  assert.match(incompleteReport, /Dates with rows: 1\/7/);
  assert.match(incompleteReport, /complete date coverage is required before comparing row totals/);

  console.log('SEO measurement test passed: period imports, filter provenance, safe URL validation, history archiving, matched-row changes, brand split, comparison guards, and private report output.');
} catch (error) {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
} finally {
  const resolvedRoot = path.resolve(temporaryRoot);
  const temporaryParent = path.resolve(os.tmpdir()) + path.sep;
  if (!resolvedRoot.startsWith(temporaryParent) || !path.basename(resolvedRoot).startsWith('centaur-seo-measurement-test-')) {
    throw new Error(`Refusing to remove unexpected measurement-test path: ${resolvedRoot}`);
  }
  fs.rmSync(resolvedRoot, { recursive: true, force: true });
}
