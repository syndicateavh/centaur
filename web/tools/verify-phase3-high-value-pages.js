#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { HIGH_VALUE_PAGE_CONTRACTS, HIGH_VALUE_PAGE_PRIORITY_THRESHOLD } from '../src/content/seo/highValuePages.js';
import { getKeywordOwnership } from '../src/seo/keywordMap.js';
import { getSeoRoute, SITE_ORIGIN } from '../src/seo/seoRoutes.js';

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

function visibleText(html) {
  const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0] || html;
  return decodeHtml(
    main
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  ).replace(/\s+/g, ' ').trim().toLowerCase();
}

function requireFragment(routePath, html, fragment) {
  if (!html.includes(fragment)) fail(`${routePath}: rendered page is missing ${fragment}`);
}

function requireLink(routePath, html, href) {
  const escapedHref = href.replaceAll('&', '&amp;');
  if (!html.includes(`href="${href}"`) && !html.includes(`href="${escapedHref}"`)) {
    fail(`${routePath}: rendered page is missing internal link ${href}`);
  }
}

if (!fs.existsSync(buildRoot)) fail('build/client is missing; run npm run build before Phase 3 verification');

const sitemapPath = path.join(buildRoot, 'sitemap.xml');
const sitemapUrls = fs.existsSync(sitemapPath)
  ? new Set([...fs.readFileSync(sitemapPath, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]))
  : new Set();

if (HIGH_VALUE_PAGE_CONTRACTS.length === 0) fail('Phase 3 must define at least one high-value page contract');

for (const contract of HIGH_VALUE_PAGE_CONTRACTS) {
  const route = getSeoRoute(contract.pageMarker);
  const ownership = getKeywordOwnership(contract.targetUrl);
  const htmlPath = outputFile(contract.targetUrl);
  const html = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, 'utf8') : '';
  const decodedHtml = decodeHtml(html);
  const text = visibleText(html);

  if (!route) {
    fail(`${contract.targetUrl}: high-value page is missing from SEO route registry`);
    continue;
  }
  if (!route.indexable) fail(`${contract.targetUrl}: high-value page must be indexable`);
  if (!ownership) fail(`${contract.targetUrl}: high-value page is missing keyword ownership`);
  const priorityThreshold = contract.priorityThreshold || HIGH_VALUE_PAGE_PRIORITY_THRESHOLD;
  if (contract.priority < priorityThreshold) fail(`${contract.targetUrl}: priority is below Phase 3 threshold (${priorityThreshold})`);
  if (!html) continue;

  requireFragment(contract.targetUrl, decodedHtml, `data-high-value-page="${contract.pageMarker}"`);
  requireFragment(contract.targetUrl, decodedHtml, `<title>${route.title}</title>`);
  requireFragment(contract.targetUrl, decodedHtml, `name="description" content="${route.description}"`);
  requireFragment(contract.targetUrl, decodedHtml, `rel="canonical" href="${SITE_ORIGIN}${route.path}"`);
  requireFragment(contract.targetUrl, decodedHtml, 'name="robots" content="index,follow"');
  requireFragment(contract.targetUrl, decodedHtml, `<h1 id="${route.id}-page-title"`);

  for (const marker of contract.requiredMarkers) requireFragment(contract.targetUrl, decodedHtml, marker);
  for (const href of contract.requiredLinks) requireLink(contract.targetUrl, decodedHtml, href);
  requireLink(contract.targetUrl, decodedHtml, contract.conversionPath);
  requireFragment(contract.targetUrl, decodedHtml, `data-conversion-path="${contract.conversionPath}"`);

  if (!sitemapUrls.has(`${SITE_ORIGIN}${route.path}`)) fail(`${contract.targetUrl}: canonical page is missing from sitemap`);
  if (text.split(/\s+/).filter(Boolean).length < contract.minimumVisibleWords) {
    fail(`${contract.targetUrl}: visible content is below the ${contract.minimumVisibleWords}-word Phase 3 floor`);
  }
  for (const term of contract.requiredTerms) {
    if (!text.includes(term.toLowerCase())) fail(`${contract.targetUrl}: visible intent coverage is missing “${term}”`);
  }
  if (ownership && !text.includes((contract.visiblePrimaryPhrase || ownership.primaryKeyword).toLowerCase())) {
    fail(`${contract.targetUrl}: primary search intent is not present in visible page content`);
  }

  if (contract.targetUrl !== '/courses/' && /100%\s+placement|guaranteed\s+placement/i.test(text)) {
    fail(`${contract.targetUrl}: contains unsupported placement-guarantee wording`);
  }
}

if (failures.length > 0) {
  console.error(`Phase 3 high-value page verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Phase 3 high-value pages verified: ${HIGH_VALUE_PAGE_CONTRACTS.length} priority owners, rendered intent coverage, commercial bridges, sitemap membership, and conversion paths are valid.`);
