#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { INDEXABLE_ROUTES, SEO_ROUTES, canonicalUrl } from '../src/seo/seoRoutes.js';

const buildRoot = path.resolve('build/client');
const failures = [];

function decodeHtml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#x27;', "'")
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function outputFileForRoute(route) {
  if (route.path === '/') return path.join(buildRoot, 'index.html');
  return path.join(buildRoot, route.path.slice(1), 'index.html');
}

for (const route of SEO_ROUTES) {
  const outputFile = outputFileForRoute(route);
  if (!fs.existsSync(outputFile)) {
    failures.push(`${route.path}: missing ${path.relative(process.cwd(), outputFile)}`);
    continue;
  }

  const rawHtml = fs.readFileSync(outputFile, 'utf8');
  const html = decodeHtml(rawHtml);
  const h1Count = (rawHtml.match(/<h1\b/gi) || []).length;
  const plainText = decodeHtml(rawHtml.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();

  if (!html.includes(`<title>${route.title}</title>`)) failures.push(`${route.path}: incorrect or missing title`);
  if (!html.includes(`name="description" content="${route.description}"`)) failures.push(`${route.path}: incorrect or missing description`);
  if (!html.includes(`rel="canonical" href="${canonicalUrl(route)}"`)) failures.push(`${route.path}: incorrect or missing canonical`);
  if (!html.includes(`name="robots" content="${route.indexable ? 'index,follow' : 'noindex,follow'}"`)) failures.push(`${route.path}: incorrect robots directive`);
  if (!html.includes(`property="og:url" content="${canonicalUrl(route)}"`)) failures.push(`${route.path}: incorrect or missing Open Graph URL`);
  if (!html.includes('property="og:image" content="https://centaurcareers.in/images/')) failures.push(`${route.path}: Open Graph image is not first-party`);
  if (!html.includes('name="twitter:card" content="summary_large_image"')) failures.push(`${route.path}: Twitter card metadata is missing`);
  if (route.indexable && !rawHtml.includes('type="application/ld+json"')) failures.push(`${route.path}: server-rendered JSON-LD is missing`);
  if (!route.indexable && rawHtml.includes('type="application/ld+json"')) failures.push(`${route.path}: noindex page should not publish page structured data`);
  if (rawHtml.includes('horizons-cdn.hostinger.com')) failures.push(`${route.path}: initial HTML still depends on the Horizons CDN`);
  if (h1Count !== 1) failures.push(`${route.path}: expected exactly one h1, found ${h1Count}`);
  if (!plainText.includes(route.h1)) failures.push(`${route.path}: expected H1 text is absent from initial HTML`);
  if (route.indexable && plainText.split(' ').length < 120) failures.push(`${route.path}: initial HTML has too little meaningful body content`);
}

const sitemapPath = path.resolve('public/sitemap.xml');
if (!fs.existsSync(sitemapPath)) {
  failures.push('public/sitemap.xml is missing');
} else {
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  if (locations.length !== INDEXABLE_ROUTES.length) {
    failures.push(`sitemap: expected ${INDEXABLE_ROUTES.length} URLs, found ${locations.length}`);
  }
  for (const route of INDEXABLE_ROUTES) {
    if (!locations.includes(canonicalUrl(route))) failures.push(`sitemap: missing ${canonicalUrl(route)}`);
  }
  if (locations.some((location) => location.includes('/404/'))) failures.push('sitemap: 404 URL must not be included');
}

for (const deploymentFile of ['.htaccess', 'robots.txt', 'sitemap.xml', 'images/brand/centaur-careers-logo.jpg']) {
  if (!fs.existsSync(path.join(buildRoot, deploymentFile))) {
    failures.push(`deployment: ${deploymentFile} was not copied to build/client`);
  }
}

if (fs.existsSync(path.join(buildRoot, '__spa-fallback.html'))) {
  failures.push('deployment: the unused SPA fallback must not be deployed');
}

if (failures.length > 0) {
  console.error(`SEO build verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`SEO build verified: ${INDEXABLE_ROUTES.length} indexable pages, one noindex 404 page, canonical metadata and sitemap are valid.`);
