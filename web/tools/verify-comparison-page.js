#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { COMPARISON_PAGE } from '../src/content/comparisonPage.js';
import { getInternalLinks } from '../src/seo/internalLinks.js';
import { getSeoRoute, SITE_ORIGIN } from '../src/seo/seoRoutes.js';

const buildRoot = path.resolve('build/client');
const sitemapPath = path.resolve('public/sitemap.xml');
const failures = [];

function fail(message) {
  failures.push(message);
}

function outputFile(publicPath) {
  return path.join(buildRoot, publicPath.slice(1), 'index.html');
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

function requireText(html, expected, label) {
  if (!decodeHtml(html).includes(expected)) fail(COMPARISON_PAGE.path + ': ' + label + ' is missing: ' + expected);
}

const route = getSeoRoute(COMPARISON_PAGE.routeId);
const filePath = outputFile(COMPARISON_PAGE.path);
const providerSourceHrefs = COMPARISON_PAGE.providers.map((provider) => provider.officialUrl);
const sourceHrefs = COMPARISON_PAGE.sources.map((source) => source.href);

if (new Set(providerSourceHrefs).size !== providerSourceHrefs.length) fail(COMPARISON_PAGE.path + ': provider source URLs must be unique');
if (new Set(sourceHrefs).size !== sourceHrefs.length) fail(COMPARISON_PAGE.path + ': source register URLs must be unique');
for (const href of sourceHrefs) {
  if (!/^https:\/\/[^\s]+$/i.test(href)) fail(COMPARISON_PAGE.path + ': source register contains a non-HTTPS URL: ' + href);
}
for (const href of providerSourceHrefs) {
  if (!sourceHrefs.includes(href)) fail(COMPARISON_PAGE.path + ': provider source is missing from the official source register: ' + href);
}

if (!fs.existsSync(filePath)) {
  fail(COMPARISON_PAGE.path + ': prerendered output is missing');
} else {
  const html = fs.readFileSync(filePath, 'utf8');
  const articleHtml = html.match(new RegExp('<article\\b[^>]*data-comparison-page="' + COMPARISON_PAGE.id + '"[^>]*>([\\s\\S]*)<\\/article>', 'i'))?.[1] || '';
  const articleText = visibleText(articleHtml);

  if (!route.indexable) fail(COMPARISON_PAGE.path + ': approved comparison route must be indexable');
  if (COMPARISON_PAGE.reviewStatus !== 'approved-for-indexing') fail(COMPARISON_PAGE.path + ': comparison review status must be approved-for-indexing');
  requireText(html, '<title>' + COMPARISON_PAGE.title + '</title>', 'title');
  requireText(html, 'name="description" content="' + COMPARISON_PAGE.description + '"', 'description');
  requireText(html, 'rel="canonical" href="' + SITE_ORIGIN + COMPARISON_PAGE.path + '"', 'canonical');
  requireText(html, 'name="robots" content="index,follow"', 'index directive');
  if (html.includes('name="robots" content="noindex,follow"')) fail(COMPARISON_PAGE.path + ': approved comparison must not be noindex');
  requireText(html, '<h1 id="' + route.id + '-page-title"', 'H1');
  requireText(html, COMPARISON_PAGE.h1, 'H1 text');
  requireText(html, 'aria-label="Breadcrumb"', 'breadcrumb');
  requireText(html, 'data-comparison-page="' + COMPARISON_PAGE.id + '"', 'comparison marker');
  requireText(html, 'data-comparison-review-status="' + COMPARISON_PAGE.reviewStatus + '"', 'review status marker');
  requireText(html, 'data-comparison-review-date="' + COMPARISON_PAGE.updatedAt + '"', 'review date marker');
  requireText(html, 'data-comparison-neutral-notice', 'neutral comparison notice');
  requireText(html, COMPARISON_PAGE.directAnswer, 'direct answer');
  requireText(html, 'data-comparison-matrix', 'comparison matrix');
  requireText(html, 'data-comparison-checklist', 'comparison checklist');
  requireText(html, 'data-comparison-sources', 'source register');

  for (const criterion of COMPARISON_PAGE.criteria) {
    requireText(html, criterion.name, 'comparison criterion');
    requireText(html, criterion.detail, 'comparison criterion detail');
  }
  for (const provider of COMPARISON_PAGE.providers) {
    requireText(html, provider.name, 'provider name');
    requireText(html, provider.publishedFocus, 'provider source summary');
    requireText(html, provider.verify, 'provider verification guidance');
    requireText(html, provider.officialUrl, 'provider source URL');
  }
  for (const source of COMPARISON_PAGE.sources) requireText(html, source.href, 'source URL');
  for (const item of COMPARISON_PAGE.checklist) requireText(html, item, 'checklist item');
  for (const faq of COMPARISON_PAGE.faqs) {
    requireText(html, faq.question, 'FAQ question');
    requireText(html, faq.answer, 'FAQ answer');
  }
  for (const link of getInternalLinks(COMPARISON_PAGE.routeId)) {
    requireText(html, 'href="' + link.to + '"', 'internal link to ' + link.routeId);
  }

  if (articleText.split(/\s+/).filter(Boolean).length < 650) fail(COMPARISON_PAGE.path + ': comparison is below the 650-word content threshold');
  if (/<img\b/i.test(articleHtml)) fail(COMPARISON_PAGE.path + ': comparison must not use provider logos or images');
  if (/"@type":"(?:Course|Article)"|"@type": "(?:Course|Article)"/i.test(html)) fail(COMPARISON_PAGE.path + ': comparison must not publish Course or Article structured data');
  if (/\b(?:cheapest|worst|number\s+one|#1)\b/i.test(articleText)) fail(COMPARISON_PAGE.path + ': comparison contains an unsupported ranking claim');
  if (/\b(?:fraud|scam|fake|stolen|plagiar|counterfeit|unauthori[sz]ed|criminal|deceptive|misleading|rip[- ]off)\b/i.test(articleText)) fail(COMPARISON_PAGE.path + ': comparison contains an accusatory or controversial claim');
  if (/\b(?:guarantees|guaranteed)\s+(?:a\s+)?(?:job|placement|salary|interview)/i.test(articleText)) fail(COMPARISON_PAGE.path + ': comparison contains an employment assurance claim');
}

const sitemap = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, 'utf8') : '';
if (!sitemap.includes(SITE_ORIGIN + COMPARISON_PAGE.path)) fail(COMPARISON_PAGE.path + ': indexable comparison must be in the sitemap');

if (failures.length > 0) {
  console.error('Comparison page verification failed:\n- ' + failures.join('\n- '));
  process.exit(1);
}

console.log('Comparison page verified: indexable neutral comparison, dated official-source register, non-affiliation notice, no provider logos, no rankings or accusations, metadata, sitemap membership, and internal links are present.');
