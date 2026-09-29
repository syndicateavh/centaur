#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {
  NEXT_CAREER_GUIDE_SPECS,
  NEXT_COMPARISON_PAGE_SPECS,
  NEXT_LANDING_PAGE_SPECS,
  NEXT_RESOURCE_SPECS,
} from '../src/content/nextSeoPages.js';
import { getSeoRoute, INDEXABLE_ROUTES } from '../src/seo/seoRoutes.js';

const buildRoot = path.resolve('build/client');
const failures = [];
const groups = Object.freeze({
  career: NEXT_CAREER_GUIDE_SPECS,
  resource: NEXT_RESOURCE_SPECS,
  landing: NEXT_LANDING_PAGE_SPECS,
  comparison: NEXT_COMPARISON_PAGE_SPECS,
});
const pages = Object.entries(groups).flatMap(([kind, items]) => items.map((page) => ({ ...page, kind })));

function fail(message) {
  failures.push(message);
}

function words(value) {
  return String(value || '').trim().split(/\s+/).filter(Boolean).length;
}

function blockText(block) {
  if (block.text) return block.text;
  if (block.items) return block.items.join(' ');
  if (block.answer) return `${block.question || ''} ${block.answer}`;
  return '';
}

function pageWordCount(page) {
  const body = (page.body || []).map(blockText).join(' ');
  const comparison = page.kind === 'comparison'
    ? [page.directAnswer, ...(page.criteria || []).flatMap((item) => [item.name, item.detail]), ...(page.faqs || []).flatMap((item) => [item.question, item.answer])].join(' ')
    : '';
  return words(`${page.h1} ${page.description} ${body} ${comparison}`);
}

function outputFile(publicPath) {
  return path.join(buildRoot, publicPath.slice(1), 'index.html');
}

if (NEXT_CAREER_GUIDE_SPECS.length !== 11) fail(`expected 11 career guides, found ${NEXT_CAREER_GUIDE_SPECS.length}`);
if (NEXT_RESOURCE_SPECS.length !== 4) fail(`expected 4 resources, found ${NEXT_RESOURCE_SPECS.length}`);
if (NEXT_LANDING_PAGE_SPECS.length !== 3) fail(`expected 3 course-decision pages, found ${NEXT_LANDING_PAGE_SPECS.length}`);
if (NEXT_COMPARISON_PAGE_SPECS.length !== 2) fail(`expected 2 comparison pages, found ${NEXT_COMPARISON_PAGE_SPECS.length}`);
if (pages.length !== 20) fail(`expected 20 next-page contracts, found ${pages.length}`);

for (const field of ['id', 'routeId', 'path', 'title', 'description', 'h1', 'primaryKeyword']) {
  const values = pages.map((page) => page[field]);
  if (values.some((value) => !value)) fail(`a next-page contract is missing ${field}`);
  if (new Set(values).size !== values.length) fail(`next-page contracts contain duplicate ${field} values`);
}

const indexableIds = new Set(INDEXABLE_ROUTES.map((route) => route.id));
for (const page of pages) {
  const route = getSeoRoute(page.routeId);
  if (route.path !== page.path) fail(`${page.path}: route path does not match its content contract`);
  if (!indexableIds.has(page.routeId)) fail(`${page.path}: route is not indexable`);
  if (route.keywordOwnerUrl !== null) fail(`${page.path}: new proxy/direct-demand page must not impersonate an imported keyword owner`);
  if (route.primaryKeyword !== page.primaryKeyword) fail(`${page.path}: primary keyword does not match the route registry`);
  if (page.title.length > 70) fail(`${page.path}: title exceeds 70 characters`);
  if (page.description.length < 100 || page.description.length > 180) fail(`${page.path}: description must contain 100-180 characters`);

  const minimumWords = page.kind === 'landing' ? 600 : 650;
  const visibleWords = pageWordCount(page);
  if (visibleWords < minimumWords) fail(`${page.path}: ${visibleWords} data-backed visible words is below the ${minimumWords}-word floor`);

  const internalBodyLinks = (page.body || []).filter((block) => block.type === 'link' && block.href?.startsWith('/'));
  if (internalBodyLinks.length < 2) fail(`${page.path}: body needs at least two contextual internal links`);
  if ((page.kind === 'career' || page.kind === 'resource') && (!page.secondaryKeywords || page.secondaryKeywords.length < 3)) {
    fail(`${page.path}: authored information page needs at least three supporting keyword variants`);
  }
  if (page.kind === 'comparison' && (!(page.criteria?.length >= 5) || !(page.faqs?.length >= 2) || !(page.sources?.length >= 2))) {
    fail(`${page.path}: comparison needs at least five criteria, two FAQs, and two sources`);
  }

  const filePath = outputFile(page.path);
  if (!fs.existsSync(filePath)) {
    fail(`${page.path}: prerendered document is missing`);
    continue;
  }
  const html = fs.readFileSync(filePath, 'utf8');
  const canonical = `https://centaurcareers.in${page.path}`;
  if (!html.includes(`<title>${page.title}</title>`)) fail(`${page.path}: rendered title is missing or incorrect`);
  if (!html.includes(`rel="canonical" href="${canonical}"`)) fail(`${page.path}: rendered canonical is missing or incorrect`);
  if (!html.includes('name="robots" content="index,follow"')) fail(`${page.path}: rendered robots directive is incorrect`);
  if (!html.includes(`<h1 id="${page.routeId}-page-title"`)) fail(`${page.path}: unique rendered H1 is missing`);
  if (!html.includes('aria-label="Breadcrumb"')) fail(`${page.path}: visible breadcrumb is missing`);
  if ((page.kind === 'career' || page.kind === 'resource') && !html.includes('"@type":"Article"')) {
    fail(`${page.path}: authored page Article schema is missing`);
  }
}

if (failures.length > 0) {
  console.error(`Next 20 SEO page verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log('Next 20 SEO pages verified: 11 career guides, 4 resources, 3 course-decision pages, and 2 comparisons meet route, indexability, metadata, content-depth, linking, schema, and prerender contracts.');
