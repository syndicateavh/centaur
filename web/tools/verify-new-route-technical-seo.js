#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { NEW_TECHNICAL_ROUTE_IDS } from '../src/seo/technicalRoutes.js';
import { INDEXABLE_ROUTES, PRERENDER_PATHS, SEO_ROUTES, SITE_ORIGIN, canonicalUrl } from '../src/seo/seoRoutes.js';

const buildRoot = path.resolve('build/client');
const failures = [];
const routeById = new Map(SEO_ROUTES.map((route) => [route.id, route]));
const indexableIds = new Set(INDEXABLE_ROUTES.map((route) => route.id));

function fail(message) {
  failures.push(message);
}

function outputFileForRoute(route) {
  if (route.path === '/') return path.join(buildRoot, 'index.html');
  return path.join(buildRoot, route.path.slice(1), 'index.html');
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

function checkRouteRegistration() {
  const ids = new Set();
  for (const routeId of NEW_TECHNICAL_ROUTE_IDS) {
    if (ids.has(routeId)) fail(`technical route inventory contains a duplicate: ${routeId}`);
    ids.add(routeId);

    const route = routeById.get(routeId);
    if (!route) {
      fail(`technical route inventory references an unknown SEO route: ${routeId}`);
      continue;
    }

    if (!route.title || !route.description || !route.h1 || !route.breadcrumbLabel || !route.schemaType) {
      fail(`${route.path}: route metadata is incomplete`);
    }
    if (!route.primaryKeyword) fail(`${route.path}: primaryKeyword is missing`);
    if (!route.lastModified) fail(`${route.path}: lastModified is missing`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(route.lastModified || '')) fail(`${route.path}: lastModified must be YYYY-MM-DD`);
    if (route.parentId && !routeById.has(route.parentId)) fail(`${route.path}: parent route is not registered`);

    const routeFile = path.resolve('src/routes', `${routeId}.jsx`);
    if (!fs.existsSync(routeFile)) {
      fail(`${route.path}: route module is missing: ${path.relative(process.cwd(), routeFile)}`);
    } else {
      const source = fs.readFileSync(routeFile, 'utf8');
      if (!source.includes(`createRouteMeta('${routeId}')`)) fail(`${route.path}: route module does not use the shared metadata factory`);
      if (!/export const meta\s*=/.test(source)) fail(`${route.path}: route module does not export meta`);
      if (!/export default/.test(source)) fail(`${route.path}: route module does not export a page component`);
    }

    const prerenderPath = route.path === '/' ? '/' : route.path.slice(0, -1);
    if (!PRERENDER_PATHS.includes(prerenderPath)) fail(`${route.path}: route is absent from PRERENDER_PATHS`);
    if (route.indexable !== indexableIds.has(routeId)) fail(`${route.path}: indexable registry mismatch`);
  }
}

function checkRenderedMetadata() {
  for (const routeId of NEW_TECHNICAL_ROUTE_IDS) {
    const route = routeById.get(routeId);
    if (!route) continue;
    const outputFile = outputFileForRoute(route);
    if (!fs.existsSync(outputFile)) {
      fail(`${route.path}: prerendered route document is missing`);
      continue;
    }

    const rawHtml = fs.readFileSync(outputFile, 'utf8');
    const html = decodeHtml(rawHtml);
    const canonical = canonicalUrl(route);
    const expectedRobots = route.indexable ? 'index,follow' : 'noindex,follow';
    const titleCount = (rawHtml.match(/<title\b/gi) || []).length;
    const descriptionCount = (rawHtml.match(/<meta\s+name="description"/gi) || []).length;
    const robotsCount = (rawHtml.match(/<meta\s+name="robots"/gi) || []).length;
    const canonicalCount = (rawHtml.match(/<link\s+rel="canonical"/gi) || []).length;
    const h1Count = (rawHtml.match(/<h1\b/gi) || []).length;

    if (titleCount !== 1) fail(`${route.path}: expected one title, found ${titleCount}`);
    if (descriptionCount !== 1) fail(`${route.path}: expected one meta description, found ${descriptionCount}`);
    if (robotsCount !== 1) fail(`${route.path}: expected one robots directive, found ${robotsCount}`);
    if (canonicalCount !== 1) fail(`${route.path}: expected one canonical link, found ${canonicalCount}`);
    if (h1Count !== 1) fail(`${route.path}: expected one H1, found ${h1Count}`);
    if (!html.includes(`<title>${route.title}</title>`)) fail(`${route.path}: title does not match the route registry`);
    if (!html.includes(`name="description" content="${route.description}"`)) fail(`${route.path}: description does not match the route registry`);
    if (!html.includes(`name="robots" content="${expectedRobots}"`)) fail(`${route.path}: robots directive does not match indexability`);
    if (!html.includes(`rel="canonical" href="${canonical}"`)) fail(`${route.path}: canonical does not match the route registry`);
    if (canonical.includes('?') || canonical.includes('#')) fail(`${route.path}: canonical must not contain a query or fragment`);
    if (!html.includes(`property="og:url" content="${canonical}"`)) fail(`${route.path}: Open Graph URL is missing or incorrect`);
    if (!html.includes('property="og:title"')) fail(`${route.path}: Open Graph title is missing`);
    if (!html.includes('property="og:description"')) fail(`${route.path}: Open Graph description is missing`);
    if (!html.includes('name="twitter:card" content="summary_large_image"')) fail(`${route.path}: Twitter card is missing`);
    if (route.indexable && !html.includes('type="application/ld+json"')) fail(`${route.path}: JSON-LD is missing from raw HTML`);
    if (!route.indexable && html.includes('type="application/ld+json"')) fail(`${route.path}: noindex route must not publish JSON-LD`);
    if (route.indexable && !html.includes('aria-label="Breadcrumb"')) fail(`${route.path}: visible breadcrumb navigation is missing`);
    if (!html.includes(`<h1 id="${route.id}-page-title"`)) fail(`${route.path}: rendered H1 does not use the route heading ID`);
    if (/(?:localhost|127\.0\.0\.1|0\.0\.0\.0|horizons-cdn\.hostinger\.com)/i.test(html)) fail(`${route.path}: raw HTML contains a private or preview reference`);

    if (route.careerGuideId || route.resourceId) {
      if (!html.includes('property="article:published_time"')) fail(`${route.path}: authored route is missing article publication metadata`);
      if (!html.includes('property="article:modified_time"')) fail(`${route.path}: authored route is missing article modification metadata`);
      if (!html.includes('name="author"')) fail(`${route.path}: authored route is missing author metadata`);
    }
  }
}

function checkSitemap() {
  const sitemapPath = path.resolve('public/sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    fail('public/sitemap.xml is missing');
    return;
  }
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const locations = [...sitemap.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)].map((match) => match[1].trim());
  for (const routeId of NEW_TECHNICAL_ROUTE_IDS) {
    const route = routeById.get(routeId);
    if (!route) continue;
    const url = canonicalUrl(route);
    if (route.indexable && !locations.includes(url)) fail(`${route.path}: indexable route is missing from sitemap.xml`);
    if (!route.indexable && locations.includes(url)) fail(`${route.path}: noindex route must not be in sitemap.xml`);
  }
  if (locations.some((location) => !location.startsWith(`${SITE_ORIGIN}/`) && location !== `${SITE_ORIGIN}/`)) {
    fail('sitemap.xml: a location is outside the configured site origin');
  }
}

checkRouteRegistration();
checkRenderedMetadata();
checkSitemap();

if (failures.length > 0) {
  console.error(`New-route technical SEO verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

const indexableCount = NEW_TECHNICAL_ROUTE_IDS.filter((routeId) => indexableIds.has(routeId)).length;
console.log(`New-route technical SEO verified: ${NEW_TECHNICAL_ROUTE_IDS.length} route contracts (${indexableCount} indexable), shared metadata, canonical URLs, sitemap membership, schema, breadcrumbs, and prerendered raw HTML are valid.`);
