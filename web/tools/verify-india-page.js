#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { CAREER_TRACKS } from '../src/content/sourceContent.js';
import { CAREER_GUIDE_TOPIC_MAP } from '../src/content/careerGuides.js';
import { INDIA_PAGE } from '../src/content/indiaPage.js';
import { REGIONAL_EXPANSION_POLICY, REGIONAL_EXPANSION_QUEUE } from '../src/content/regionalPages.js';
import { getInternalLinks } from '../src/seo/internalLinks.js';
import { getSeoRoute, SEO_ROUTES } from '../src/seo/seoRoutes.js';

const buildRoot = path.resolve('build/client');
const failures = [];

function fail(message) {
  failures.push(message);
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

function readPage(publicPath) {
  const filePath = outputFile(publicPath);
  if (!fs.existsSync(filePath)) {
    fail(`${publicPath}: prerendered output is missing`);
    return '';
  }
  return decodeHtml(fs.readFileSync(filePath, 'utf8'));
}

function requireText(publicPath, html, expected) {
  if (!html.includes(expected)) fail(`${publicPath}: rendered content is missing ${expected}`);
}

function requireLink(publicPath, html, href) {
  if (!html.includes(`href="${href}"`)) fail(`${publicPath}: rendered link is missing ${href}`);
}

const route = getSeoRoute('india');
const html = readPage(INDIA_PAGE.path);

if (!route.indexable) fail(`${INDIA_PAGE.path}: India page must be indexable`);
requireText(INDIA_PAGE.path, html, `<title>${route.title}</title>`);
requireText(INDIA_PAGE.path, html, `name="description" content="${route.description}"`);
requireText(INDIA_PAGE.path, html, `rel="canonical" href="https://centaurcareers.in${route.path}"`);
requireText(INDIA_PAGE.path, html, 'name="robots" content="index,follow"');
requireText(INDIA_PAGE.path, html, `<h1 id="${route.id}-page-title"`);
requireText(INDIA_PAGE.path, html, route.h1);
requireText(INDIA_PAGE.path, html, 'aria-label="Breadcrumb"');
requireText(INDIA_PAGE.path, html, 'data-national-page="india"');
requireText(INDIA_PAGE.path, html, 'data-national-direct-answer');
requireText(INDIA_PAGE.path, html, INDIA_PAGE.directAnswer);
requireText(INDIA_PAGE.path, html, 'data-national-operations-map');
requireText(INDIA_PAGE.path, html, 'data-national-location-boundary');
requireText(INDIA_PAGE.path, html, 'data-regional-publishing-policy');
requireText(INDIA_PAGE.path, html, REGIONAL_EXPANSION_POLICY.selectionRule);
requireText(INDIA_PAGE.path, html, REGIONAL_EXPANSION_POLICY.localScopeRule);
requireText(INDIA_PAGE.path, html, REGIONAL_EXPANSION_POLICY.accessBoundary);
requireText(INDIA_PAGE.path, html, 'data-national-faq="india"');
requireText(INDIA_PAGE.path, html, 'Mindsprout Career Hub');
requireText(INDIA_PAGE.path, html, 'Lucknow');

for (const track of CAREER_TRACKS) requireText(INDIA_PAGE.path, html, track.title);
for (const topic of CAREER_GUIDE_TOPIC_MAP) {
  requireText(INDIA_PAGE.path, html, `data-national-operations-topic="${topic.id}"`);
  requireText(INDIA_PAGE.path, html, topic.label);
  requireText(INDIA_PAGE.path, html, topic.question);
  requireLink(INDIA_PAGE.path, html, topic.primaryPath);
  requireLink(INDIA_PAGE.path, html, topic.supportPath);
}
for (const faq of INDIA_PAGE.faqs) {
  requireText(INDIA_PAGE.path, html, faq.question);
  requireText(INDIA_PAGE.path, html, faq.answer);
}

for (const href of [
  '/courses/',
  '/career-guides/',
  '/resources/',
  '/resources/investment-banking-interview-questions/',
  '/locations/lucknow/',
  '/faqs/',
  '/contact/',
]) requireLink(INDIA_PAGE.path, html, href);

for (const link of getInternalLinks('india')) requireLink(INDIA_PAGE.path, html, link.to);
for (const market of REGIONAL_EXPANSION_QUEUE.filter((candidate) => candidate.status === 'gated')) {
  if (html.includes(market.path)) fail(`${INDIA_PAGE.path}: gated regional destination is exposed as a public path: ${market.path}`);
}
if (!html.includes('"@type":"WebPage"') && !html.includes('"@type": "WebPage"')) {
  fail(`${INDIA_PAGE.path}: WebPage structured data is missing`);
}
if (!html.includes('"@type":"BreadcrumbList"') && !html.includes('"@type": "BreadcrumbList"')) {
  fail(`${INDIA_PAGE.path}: BreadcrumbList structured data is missing`);
}
if (html.includes('"@type":"Course"') || html.includes('"@type": "Course"')) {
  fail(`${INDIA_PAGE.path}: national access page must not publish a standalone Course entity`);
}
if (/(?:physical|offline)\s+(?:branches|centres|centers)\s+across\s+India|placement\s+guarantee|guaranteed\s+(?:placement|job|interview)|typical\s+salary|average\s+salary/i.test(html)) {
  fail(`${INDIA_PAGE.path}: national page contains unsupported physical-network, guarantee, or salary language`);
}

if (!SEO_ROUTES.some((candidate) => candidate.path === INDIA_PAGE.path)) {
  fail(`${INDIA_PAGE.path}: India page is not registered in SEO routes`);
}

if (failures.length > 0) {
  console.error(`India-wide page verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log('India-wide page verified: national access intent, curriculum directions, mode distinction, Lucknow boundary, FAQs, metadata, schema, and internal links are present in prerendered HTML.');
