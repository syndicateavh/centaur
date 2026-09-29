#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { INDEXABLE_ROUTES, SEO_ROUTES, canonicalUrl } from '../src/seo/seoRoutes.js';
import { getExpectedSitemapUrls } from './blog-sitemap.js';

const buildRoot = path.resolve('build/client');
const failures = [];
const renderedTitles = new Map();

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
  const titleCount = (rawHtml.match(/<title\b/gi) || []).length;
  const descriptionCount = (rawHtml.match(/<meta\s+name="description"/gi) || []).length;
  const robotsCount = (rawHtml.match(/<meta\s+name="robots"/gi) || []).length;
  const canonicalCount = (rawHtml.match(/<link\s+rel="canonical"/gi) || []).length;
  const mainCount = (rawHtml.match(/<main\b/gi) || []).length;
  const headerCount = (rawHtml.match(/<header\b/gi) || []).length;
  const footerCount = (rawHtml.match(/<footer\b/gi) || []).length;
  const ids = [...rawHtml.matchAll(/\bid="([^"]+)"/gi)].map((match) => match[1]);
  const images = [...rawHtml.matchAll(/<img\b[^>]*>/gi)].map((match) => match[0]);
  const labelledByTargets = [...rawHtml.matchAll(/\baria-labelledby="([^"]+)"/gi)].flatMap((match) => match[1].split(/\s+/));
  const plainText = decodeHtml(rawHtml.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
  const renderedTitle = decodeHtml(rawHtml.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').trim();

  if (!html.includes('<html lang="en-IN"')) failures.push(`${route.path}: document language is missing or incorrect`);
  if (titleCount !== 1) failures.push(`${route.path}: expected exactly one title, found ${titleCount}`);
  if (descriptionCount !== 1) failures.push(`${route.path}: expected exactly one description, found ${descriptionCount}`);
  if (robotsCount !== 1) failures.push(`${route.path}: expected exactly one robots directive, found ${robotsCount}`);
  if (canonicalCount !== 1) failures.push(`${route.path}: expected exactly one canonical link, found ${canonicalCount}`);
  if (mainCount !== 1) failures.push(`${route.path}: expected exactly one main landmark, found ${mainCount}`);
  if (headerCount !== 1) failures.push(`${route.path}: expected exactly one header landmark, found ${headerCount}`);
  if (footerCount !== 1) failures.push(`${route.path}: expected exactly one footer landmark, found ${footerCount}`);
  if (new Set(ids).size !== ids.length) failures.push(`${route.path}: duplicate HTML ids are present`);
  for (const target of labelledByTargets) {
    if (!ids.includes(target)) failures.push(`${route.path}: aria-labelledby target is missing: ${target}`);
  }
  for (const image of images) {
    if (!/\balt="/.test(image)) failures.push(`${route.path}: image is missing an alt attribute`);
    if (!/\bwidth="\d+"/.test(image) || !/\bheight="\d+"/.test(image)) {
      failures.push(`${route.path}: image is missing explicit width/height dimensions`);
    }
  }
  if (route.indexable && route.path !== '/' && !html.includes('aria-label="Breadcrumb"')) {
    failures.push(`${route.path}: visible breadcrumb navigation is missing`);
  }
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

  if (route.indexable) {
    if (!renderedTitle) failures.push(`${route.path}: rendered title is empty`);
    const existingRoute = renderedTitles.get(renderedTitle);
    if (existingRoute) {
      failures.push(`${route.path}: rendered title duplicates ${existingRoute}: ${renderedTitle}`);
    } else if (renderedTitle) {
      renderedTitles.set(renderedTitle, route.path);
    }
  }
}

const sitemapPath = path.resolve('public/sitemap.xml');
if (!fs.existsSync(sitemapPath)) {
  failures.push('public/sitemap.xml is missing');
} else {
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  const expectedLocations = getExpectedSitemapUrls();
  if (locations.length !== expectedLocations.length) {
    failures.push(`sitemap: expected ${expectedLocations.length} URLs, found ${locations.length}`);
  }
  for (const location of expectedLocations) {
    if (!locations.includes(location)) failures.push(`sitemap: missing ${location}`);
  }
  if (locations.some((location) => location.includes('/404/'))) failures.push('sitemap: 404 URL must not be included');
}

for (const deploymentFile of ['.htaccess', 'robots.txt', 'sitemap.xml', 'llms.txt', 'images/brand/centaur-careers-logo.jpg']) {
  const publicFile = path.resolve('public', deploymentFile);
  const buildFile = path.join(buildRoot, deploymentFile);
  if (!fs.existsSync(buildFile)) {
    failures.push(`deployment: ${deploymentFile} was not copied to build/client`);
  } else if (['.htaccess', 'robots.txt', 'sitemap.xml', 'llms.txt'].includes(deploymentFile)
    && !fs.existsSync(publicFile)) {
    failures.push(`deployment: source public/${deploymentFile} is missing`);
  } else if (['.htaccess', 'robots.txt', 'sitemap.xml', 'llms.txt'].includes(deploymentFile)
    && fs.readFileSync(publicFile, 'utf8') !== fs.readFileSync(buildFile, 'utf8')) {
    failures.push(`deployment: ${deploymentFile} differs between public/ and build/client`);
  }
}

if (fs.existsSync(path.join(buildRoot, '__spa-fallback.html'))) {
  failures.push('deployment: the unused SPA fallback must not be deployed');
}

if (failures.length > 0) {
  console.error(`SEO build verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`SEO build verified: ${INDEXABLE_ROUTES.length} indexable pages plus published blog URLs, one noindex 404 page, canonical metadata and sitemap are valid.`);
