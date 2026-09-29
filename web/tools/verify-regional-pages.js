#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { loadBlogPosts } from './blog-storage.js';
import { blogPostPath } from '../src/content/blog/blogRoutes.js';
import { REGIONAL_EXPANSION_POLICY, REGIONAL_EXPANSION_QUEUE, REGIONAL_PAGES } from '../src/content/regionalPages.js';
import { getInternalLinks } from '../src/seo/internalLinks.js';
import { getSeoRoute, SEO_ROUTES, SITE_ORIGIN } from '../src/seo/seoRoutes.js';

const buildRoot = path.resolve('build/client');
const failures = [];
const stopWords = new Set(['about', 'after', 'also', 'and', 'are', 'can', 'from', 'for', 'has', 'have', 'into', 'learners', 'more', 'page', 'that', 'the', 'their', 'this', 'through', 'with', 'your']);
const markerSets = {
  'delhi-ncr': ['delhi-ncr', 'gurugram', 'noida', 'gcc'],
  bengaluru: ['bengaluru', 'fintech', 'gcc', 'karnataka'],
  mumbai: ['mumbai', 'sebi', 'settlements', 'fintech'],
  pune: ['pune', 'hinjawadi', 'stpi', 'maharashtra'],
  hyderabad: ['hyderabad', 'telangana', 'gcc', 'gachibowli'],
};

function fail(message) {
  failures.push(message);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function outputFile(publicPath) {
  return path.join(buildRoot, publicPath === '/' ? 'index.html' : publicPath.slice(1), 'index.html');
}

function decodeHtml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#x27;', "'")
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function visibleText(html) {
  return decodeHtml(html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' '))
    .trim();
}

function meaningfulTokens(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(/\s+/).filter((token) => token.length > 2 && !stopWords.has(token));
}

function shingles(value) {
  const tokens = meaningfulTokens(value);
  const output = new Set();
  for (let index = 0; index <= tokens.length - 5; index += 1) output.add(tokens.slice(index, index + 5).join(' '));
  return output;
}

function copyOverlap(first, second) {
  const firstShingles = shingles(first);
  const secondShingles = shingles(second);
  const smaller = Math.min(firstShingles.size, secondShingles.size);
  if (!smaller) return 0;
  let shared = 0;
  for (const shingle of firstShingles) if (secondShingles.has(shingle)) shared += 1;
  return shared / smaller;
}

function requireText(page, html, expected, label) {
  if (!decodeHtml(html).includes(expected)) fail(`${page.path}: ${label} is missing: ${expected}`);
}

const articleTexts = new Map();
const queueByRouteId = new Map(REGIONAL_EXPANSION_QUEUE.map((market) => [market.routeId, market]));
const publishedBlogPaths = new Set(loadBlogPosts()
  .filter((post) => post.status === 'published')
  .map((post) => blogPostPath(post.slug)));
const coursesHtml = fs.readFileSync(outputFile('/courses/'), 'utf8');
const careerGuidesHtml = fs.readFileSync(outputFile('/career-guides/'), 'utf8');

if (!careerGuidesHtml.includes('href="/india/"')) fail('/career-guides/: India-wide access link is missing');

if (REGIONAL_PAGES.length !== REGIONAL_EXPANSION_POLICY.publishedGuideLimit) {
  fail(`Selective regional wave must contain exactly ${REGIONAL_EXPANSION_POLICY.publishedGuideLimit} published routes; found ${REGIONAL_PAGES.length}`);
}

if (new Set(REGIONAL_EXPANSION_QUEUE.map((market) => market.routeId)).size !== REGIONAL_EXPANSION_QUEUE.length) {
  fail('Regional expansion queue contains duplicate route IDs');
}

for (const page of REGIONAL_PAGES) {
  requireText(page, coursesHtml, `href="${page.path}"`, 'course-page regional discovery link');
  const market = queueByRouteId.get(page.routeId);
  if (!market || market.status !== 'published') fail(`${page.path}: published regional page is missing a published expansion-queue record`);
}

for (const market of REGIONAL_EXPANSION_QUEUE.filter((candidate) => candidate.status === 'gated')) {
  if (SEO_ROUTES.some((route) => route.id === market.routeId || route.path === market.path)) {
    fail(`${market.path}: gated regional destination must not be published before its evidence review`);
  }
  if (!market.requirements?.length) fail(`${market.path}: gated market must list publication requirements`);
}

for (const page of REGIONAL_PAGES) {
  const route = getSeoRoute(page.routeId);
  const filePath = outputFile(page.path);
  if (!fs.existsSync(filePath)) {
    fail(`${page.path}: prerendered output is missing`);
    continue;
  }

  const html = fs.readFileSync(filePath, 'utf8');
  const articleMatch = html.match(new RegExp(`<article\\b[^>]*\\bdata-regional-page="${page.id}"[^>]*>([\\s\\S]*?)<\\/article>`, 'i'));
  const articleHtml = articleMatch?.[1] || '';
  const articleText = visibleText(articleHtml);
  articleTexts.set(page.id, articleText);

  if (!route.indexable) fail(`${page.path}: regional route must be indexable`);
  requireText(page, html, `<title>${page.title}</title>`, 'title');
  requireText(page, html, `name="description" content="${page.description}"`, 'description');
  requireText(page, html, `rel="canonical" href="${SITE_ORIGIN}${page.path}"`, 'canonical');
  requireText(page, html, 'name="robots" content="index,follow"', 'robots directive');
  requireText(page, html, `<h1 id="${page.routeId}-page-title"`, 'H1');
  requireText(page, html, page.h1, 'H1 text');
  requireText(page, html, 'aria-label="Breadcrumb"', 'breadcrumb');
  requireText(page, html, `data-regional-page="${page.id}"`, 'regional page marker');
  requireText(page, html, 'data-regional-direct-answer', 'direct-answer marker');
  requireText(page, html, page.directAnswer, 'direct answer');
  requireText(page, html, 'data-regional-program-answer', 'program availability answer');
  requireText(page, html, page.courseQuestion, 'regional course question');
  requireText(page, html, 'one six-week Financial Operations Masterclass', 'one-program boundary');
  requireText(page, html, `dateTime="${page.sourceReviewedAt || page.updatedAt}"`, 'source review date');
  requireText(page, html, 'data-regional-search-scope', 'local search scope');
  requireText(page, html, page.localAreaNote, 'local area guidance');
  for (const area of page.localAreas) requireText(page, html, area, 'local search area');
  requireText(page, html, 'data-regional-evidence', 'evidence section');
  requireText(page, html, 'data-regional-access-boundary', 'access boundary');
  requireText(page, html, 'data-regional-workflow-pathways', 'workflow-pathway section');
  if (!Array.isArray(page.workflowLinks) || page.workflowLinks.length !== 3) fail(`${page.path}: regional workflow pathway set must contain exactly three canonical destinations`);
  for (const workflowLink of page.workflowLinks || []) {
    const target = SEO_ROUTES.find((candidate) => candidate.path === workflowLink.path);
    if (!target?.indexable && !publishedBlogPaths.has(workflowLink.path)) fail(`${page.path}: workflow pathway is not an indexable canonical route: ${workflowLink.path}`);
    requireText(page, html, workflowLink.label, 'workflow pathway label');
    requireText(page, html, `href="${workflowLink.path}"`, 'workflow pathway link');
    requireText(page, html, `data-regional-workflow-pathway="${workflowLink.path}"`, 'workflow pathway marker');
  }
  requireText(page, html, `data-regional-faq="${page.id}"`, 'FAQ section');
  requireText(page, html, 'data-regional-role-example', 'illustrative local example');
  for (const detail of [page.localResearchExample?.title, page.localResearchExample?.situation, page.localResearchExample?.decision]) {
    if (!detail) fail(`${page.path}: local example is incomplete`);
    else requireText(page, html, detail, 'local example detail');
  }
  if (!page.localResearchExample?.situation.includes('illustrative')) fail(`${page.path}: local example must say it is illustrative`);
  if (!page.localResearchExample?.guidePath || !html.includes(`href="${page.localResearchExample.guidePath}"`)) fail(`${page.path}: local example lacks a related guide link`);

  for (const marker of markerSets[page.id] || []) {
    if (!articleText.toLowerCase().includes(marker.toLowerCase())) fail(`${page.path}: unique regional marker is missing: ${marker}`);
  }
  if (meaningfulTokens(articleText).length < 400) fail(`${page.path}: unique regional article content is below the 400-word quality threshold`);
  if (page.evidence.length < 2) fail(`${page.path}: fewer than two public evidence sources are attached`);
  for (const source of page.evidence) {
    if (!/^https:\/\//.test(source.href)) fail(`${page.path}: evidence URL is not HTTPS: ${source.href}`);
    requireText(page, html, source.href, 'evidence link');
  }
  for (const faq of page.faqs) {
    requireText(page, html, faq.question, 'FAQ question');
    requireText(page, html, faq.answer, 'FAQ answer');
  }
  for (const link of getInternalLinks(page.routeId)) {
    requireText(page, html, `href="${link.to}"`, `internal link to ${link.routeId}`);
  }

  if (!html.includes('"@type":"WebPage"') && !html.includes('"@type": "WebPage"')) fail(`${page.path}: WebPage structured data is missing`);
  if (!html.includes('"spatialCoverage":{"@id":"https://centaurcareers.in' + page.path + '#regional-coverage"') && !html.includes('"spatialCoverage": {"@id": "https://centaurcareers.in' + page.path + '#regional-coverage"')) {
    fail(`${page.path}: regional spatialCoverage structured data is missing`);
  }
  if (!html.includes('"@type":"BreadcrumbList"') && !html.includes('"@type": "BreadcrumbList"')) fail(`${page.path}: BreadcrumbList structured data is missing`);
  if (html.includes('"@type":"Course"') || html.includes('"@type": "Course"')) fail(`${page.path}: regional guide must not publish a standalone Course entity`);
  if (html.includes('"@type":"Article"') || html.includes('"@type": "Article"')) fail(`${page.path}: regional guide must not publish Article schema for market research`);
  if (/\b(?:guarantees|guaranteed)\s+(?:a\s+)?(?:job|placement|salary|interview)/i.test(articleText)) fail(`${page.path}: regional guide contains a positive guarantee claim`);
  const localNames = [page.regionName, 'Delhi', 'Gurugram', 'Noida', 'Mumbai', 'Bengaluru', 'Bangalore'].map(escapeRegExp).join('|');
  const positiveLocalOffice = new RegExp(`\\b(?:Centaur Careers|Centaur)\\b[^.]{0,100}\\b(?:has|maintains|operates|offers|provides|publishes)\\b[^.]{0,100}\\b(?:office|branch|classroom|centre|center)\\b[^.]{0,80}\\b(?:${localNames})\\b`, 'i');
  if (positiveLocalOffice.test(articleText)) {
    fail(`${page.path}: regional guide contains a positive local-office or branch claim`);
  }
}

const regionalIds = new Set(REGIONAL_PAGES.map((page) => page.routeId));
for (const page of REGIONAL_PAGES) {
  for (const other of REGIONAL_PAGES) {
    if (page.id >= other.id) continue;
    const overlap = copyOverlap(articleTexts.get(page.id) || '', articleTexts.get(other.id) || '');
    if (overlap > 0.4) fail(`${page.path} and ${other.path}: more than 40% of the article body is shared (${Math.round(overlap * 100)}%)`);
  }
}

if (regionalIds.size !== REGIONAL_EXPANSION_POLICY.publishedGuideLimit) fail(`Published regional route IDs are not unique; found ${regionalIds.size}`);

if (failures.length > 0) {
  console.error(`Regional page quality verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Regional page quality verified: ${REGIONAL_PAGES.length} selective pages have unique market content, public evidence, learner-access boundaries, metadata, schema, FAQs, and canonical internal links.`);
