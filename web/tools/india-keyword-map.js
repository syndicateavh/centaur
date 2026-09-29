#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { KEYWORD_STRATEGY_ROWS, KEYWORD_OWNERSHIP } from '../src/content/seo/keywordStrategy.js';
import { INDEXABLE_ROUTES } from '../src/seo/seoRoutes.js';
import { getExpectedSitemapUrls } from './blog-sitemap.js';

const root = path.resolve('data/seo');
const plan = JSON.parse(fs.readFileSync(path.join(root, 'india-keyword-priorities-2026-09-26.json'), 'utf8'));
const gap = JSON.parse(fs.readFileSync(path.join(root, 'keyword-gap/semrush-organic-competitors-keyword-gap-mapped-2026-09-23.json'), 'utf8'));
const output = path.join(root, 'india-keyword-map-2026-09-26.csv');
const summaryOutput = path.join(root, 'india-keyword-page-priorities-2026-09-26.csv');
const decisionsOutput = path.join(root, 'india-keyword-review-decisions-2026-09-26.csv');
const checkOnly = process.argv.includes('--check');
const failures = [];

const normalize = (value) => String(value).toLowerCase().replace(/\s+/g, ' ').trim();
const priorityOrder = { P0: 0, P1: 1, P2: 2, P3: 3 };
const routeByPath = new Map(INDEXABLE_ROUTES.map((route) => [route.path, route]));
const publishedPaths = new Set(getExpectedSitemapUrls().map((url) => new URL(url).pathname));
const pageByPath = new Map(plan.pages.map((page) => [page.path, page]));
const gapByKeyword = new Map(gap.keywords.map((row) => [normalize(row.normalizedKeyword), row]));
const approvedByKeyword = new Map();

function fail(message) { failures.push(message); }
function cell(value) {
  const string = String(value ?? '');
  return /[",\r\n]/.test(string) ? `"${string.replaceAll('"', '""')}"` : string;
}
function csv(headers, rows) {
  return [headers, ...rows].map((row) => row.map(cell).join(',')).join('\r\n') + '\r\n';
}
function checkFile(file, content) {
  if (checkOnly) {
    if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== content) fail(`${path.relative(process.cwd(), file)} is missing or stale`);
  } else {
    fs.writeFileSync(file, content, 'utf8');
  }
}

if (plan.market !== 'India' || plan.metricMarket !== 'unverified in Semrush export') fail('Market and metric provenance must remain explicit');
if (plan.pages.length !== Object.keys(KEYWORD_OWNERSHIP).length) fail('Every approved target requires one page priority');
if (pageByPath.size !== plan.pages.length) fail('Page priorities contain duplicate paths');
for (const page of plan.pages) {
  if (!KEYWORD_OWNERSHIP[page.path] || !routeByPath.has(page.path)) fail(`Unknown or nonindexable page ${page.path}`);
  if (!(page.priority in priorityOrder) || !page.role || !page.action || !page.guardrail) fail(`Incomplete plan for ${page.path}`);
}
for (const path of Object.keys(KEYWORD_OWNERSHIP)) {
  if (!pageByPath.has(path)) fail(`Missing page priority for ${path}`);
}

for (const row of KEYWORD_STRATEGY_ROWS) {
  const keyword = normalize(row.normalizedKeyword);
  if (approvedByKeyword.has(keyword) && approvedByKeyword.get(keyword) !== row.targetUrl) fail(`Conflicting approved owner for ${row.keyword}`);
  approvedByKeyword.set(keyword, row.targetUrl);
  if (!pageByPath.has(row.targetUrl)) fail(`Unplanned approved owner ${row.targetUrl}`);
}

const reviewedByKeyword = new Map();
for (const review of plan.reviewedQueries) {
  const keyword = normalize(review.keyword);
  if (reviewedByKeyword.has(keyword)) fail(`Duplicate reviewed query ${keyword}`);
  reviewedByKeyword.set(keyword, review);
  if (!['existing', 'candidate', 'hold'].includes(review.decision) || !review.reason) fail(`Incomplete review for ${keyword}`);
  if (review.decision === 'existing' && !publishedPaths.has(review.owner)) fail(`Existing owner is not in the published sitemap for ${keyword}`);
  if (review.decision === 'candidate' && (!review.owner?.startsWith('/') || routeByPath.has(review.owner))) fail(`Candidate must be an unpublished path for ${keyword}`);
  if (review.decision === 'hold' && review.owner) fail(`Held query ${keyword} must not have a page owner`);
  if (!gapByKeyword.has(keyword)) fail(`Reviewed query is absent from Semrush source: ${keyword}`);
  if (approvedByKeyword.has(keyword) && approvedByKeyword.get(keyword) !== review.owner) fail(`Review conflicts with approved owner for ${keyword}`);
}

for (const route of INDEXABLE_ROUTES) {
  const keyword = normalize(route.primaryKeyword);
  const approvedOwner = approvedByKeyword.get(keyword);
  if (approvedOwner && approvedOwner !== route.path) fail(`${route.path} primaryKeyword duplicates approved owner ${approvedOwner}: ${keyword}`);
}

if (failures.length) {
  console.error(`India keyword map failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

const approvedRows = [...KEYWORD_STRATEGY_ROWS]
  .sort((a, b) => priorityOrder[pageByPath.get(a.targetUrl).priority] - priorityOrder[pageByPath.get(b.targetUrl).priority] || b.priority - a.priority || a.id - b.id)
  .map((row) => {
    const page = pageByPath.get(row.targetUrl);
    const matched = gapByKeyword.get(normalize(row.normalizedKeyword));
    return [row.id, row.keyword, row.cluster, row.intent, row.funnel, row.targetUrl, page.priority,
      row.normalizedKeyword === KEYWORD_OWNERSHIP[row.targetUrl].primaryKeywordNormalized ? 'primary' : 'supporting',
      row.priority, matched?.volume ?? '', matched?.keywordDifficulty ?? '', matched ? plan.metricMarket : 'no exact Semrush match',
      page.role, page.action, page.guardrail];
  });
checkFile(output, csv(['approved_id', 'keyword', 'cluster', 'intent', 'funnel', 'owner_url', 'phase2_priority', 'page_keyword_role', 'approved_priority_score', 'semrush_volume_estimate', 'semrush_kd_estimate', 'metric_market', 'page_role', 'next_action', 'claim_guardrail'], approvedRows));

const summaryRows = [...plan.pages]
  .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || a.path.localeCompare(b.path))
  .map((page) => [page.priority, page.path, KEYWORD_OWNERSHIP[page.path].primaryKeyword,
    KEYWORD_OWNERSHIP[page.path].keywordCount, page.role, page.action, page.guardrail]);
checkFile(summaryOutput, csv(['priority', 'owner_url', 'approved_primary_keyword', 'approved_keyword_count', 'page_role', 'next_action', 'claim_guardrail'], summaryRows));

const decisionRows = plan.reviewedQueries.map((review) => {
  const matched = gapByKeyword.get(normalize(review.keyword));
  return [review.keyword, review.decision, review.owner, matched.volume ?? '', matched.keywordDifficulty ?? '', plan.metricMarket, matched.ownershipStatus, review.reason];
});
checkFile(decisionsOutput, csv(['keyword', 'decision', 'owner_or_candidate_url', 'semrush_volume_estimate', 'semrush_kd_estimate', 'metric_market', 'source_mapping_status', 'reason'], decisionRows));

console.log(`India keyword map ${checkOnly ? 'verified' : 'generated'}: ${approvedRows.length} approved queries, ${summaryRows.length} page owners, ${decisionRows.length} reviewed Semrush queries; metrics are not verified India volumes.`);
