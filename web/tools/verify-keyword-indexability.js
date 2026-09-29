#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { createKeywordIndexabilityMap } from '../src/seo/keywordIndexability.js';
import { KEYWORD_STRATEGY_ROWS } from '../src/seo/keywordMap.js';
import { SEO_ROUTES } from '../src/seo/seoRoutes.js';

const mapPath = path.resolve('docs/seo-keyword-indexability-map.json');
const buildRoot = path.resolve('build/client');
const failures = [];

function fail(message) {
  failures.push(message);
}

function outputFileForPath(routePath) {
  return routePath === '/'
    ? path.join(buildRoot, 'index.html')
    : path.join(buildRoot, routePath.slice(1), 'index.html');
}

function extractCanonical(html) {
  return html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1]
    || html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i)?.[1]
    || null;
}

if (!fs.existsSync(mapPath)) {
  fail('generated map is missing; run npm run seo:keywords:indexability:map after npm run build');
}
if (!fs.existsSync(buildRoot)) {
  fail('build/client is missing; run npm run build before verifying keyword indexability');
}

let actualMap = null;
if (failures.length === 0) {
  try {
    actualMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  } catch (error) {
    fail(`generated map is not valid JSON: ${error.message}`);
  }
}

if (failures.length === 0) {
  const sitemapPath = path.join(buildRoot, 'sitemap.xml');
  const sitemapUrls = fs.existsSync(sitemapPath)
    ? new Set([...fs.readFileSync(sitemapPath, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]))
    : new Set();
  const prerenderedByPath = new Map();
  const renderedCanonicalByPath = new Map();

  for (const route of SEO_ROUTES) {
    const htmlPath = outputFileForPath(route.path);
    const rendered = fs.existsSync(htmlPath);
    prerenderedByPath.set(route.path, rendered);
    renderedCanonicalByPath.set(route.path, rendered ? extractCanonical(fs.readFileSync(htmlPath, 'utf8')) : null);
  }

  const expectedMap = createKeywordIndexabilityMap({
    available: true,
    sitemapUrls,
    prerenderedByPath,
    renderedCanonicalByPath,
  });

  if (JSON.stringify(actualMap) !== JSON.stringify(expectedMap)) {
    fail('generated map is stale or does not match the current keyword strategy, route registry, links, or build; run npm run seo:keywords:indexability:map');
  }
}

if (actualMap) {
  if (actualMap.schemaVersion !== 1) fail(`unsupported keyword-indexability schema version: ${actualMap.schemaVersion}`);
  if (actualMap.source?.country !== 'IN' || actualMap.source?.language !== 'en-IN') fail('map source must be scoped to the approved IN / en-IN strategy');
  if (actualMap.summary?.keywordCount !== KEYWORD_STRATEGY_ROWS.length) fail('map keyword summary does not match the imported strategy rows');
  if (actualMap.keywords?.length !== KEYWORD_STRATEGY_ROWS.length) fail('map does not contain one record per approved keyword');
  if (new Set(actualMap.keywords?.map((keyword) => keyword.normalizedKeyword)).size !== actualMap.keywords?.length) fail('map contains duplicate normalized keyword records');
  if (actualMap.summary?.targetCount !== actualMap.targets?.length) fail('map target summary does not match target records');

  const targetsByUrl = new Map((actualMap.targets || []).map((target) => [target.targetUrl, target]));
  const routesByPath = new Map(SEO_ROUTES.map((route) => [route.path, route]));
  const keywordIds = new Set();

  for (const target of actualMap.targets || []) {
    if (!target.targetUrl || !target.canonicalUrl) fail('every target must have a target URL and canonical URL');
    if (target.indexability?.routeRegistered !== true) fail(`${target.targetUrl}: target is not registered in SEO_ROUTES`);
    if (target.indexability?.indexable !== true) fail(`${target.targetUrl}: keyword owner must resolve to an indexable route`);
    if (target.indexability?.status !== 'indexable') fail(`${target.targetUrl}: indexability status is not indexable`);
    if (target.indexability?.robots !== 'index,follow') fail(`${target.targetUrl}: robots policy must be index,follow`);
    if (target.indexability?.sitemapEligible !== true || target.indexability?.sitemapIncluded !== true) fail(`${target.targetUrl}: target must be eligible for and present in the sitemap`);
    if (target.indexability?.prerendered !== true) fail(`${target.targetUrl}: target must be prerendered`);
    if (target.indexability?.canonicalMatches !== true) fail(`${target.targetUrl}: rendered canonical does not match the map canonical`);
    if (target.internalLinks?.inboundCount < 1 || target.internalLinks?.orphan) fail(`${target.targetUrl}: target is orphaned in the registered internal-link architecture`);
    if (!target.conversionDestination?.path) fail(`${target.targetUrl}: conversion destination is missing`);

    const route = routesByPath.get(target.targetUrl);
    const outboundPaths = new Set((target.internalLinks?.outbound || []).map((link) => link.path));
    if (route?.keywordOwnerUrl !== target.targetUrl) fail(`${target.targetUrl}: route keywordOwnerUrl does not point back to the map target`);
    if (route?.primaryKeyword !== target.ownership?.primaryKeyword) fail(`${target.targetUrl}: route primary keyword does not match map ownership`);
    if (!outboundPaths.has(target.conversionDestination.path)) fail(`${target.targetUrl}: conversion destination is not an internal link from the owner page`);
    if (!routesByPath.get(target.conversionDestination.path)?.indexable) fail(`${target.targetUrl}: conversion destination is not indexable`);
  }

  for (const keyword of actualMap.keywords || []) {
    if (keywordIds.has(keyword.id)) fail(`duplicate keyword ID in map: ${keyword.id}`);
    keywordIds.add(keyword.id);
    const target = targetsByUrl.get(keyword.owner?.targetUrl);
    if (!target) {
      fail(`${keyword.keyword}: owner target is missing from the map`);
      continue;
    }
    if (keyword.owner.canonicalUrl !== target.canonicalUrl) fail(`${keyword.keyword}: owner canonical does not match target canonical`);
    if (keyword.indexability.status !== target.indexability.status) fail(`${keyword.keyword}: keyword status does not match owner status`);
    if (keyword.indexability.indexable !== true) fail(`${keyword.keyword}: approved keyword is assigned to a non-indexable destination`);
  }
}

if (failures.length > 0) {
  console.error(`Keyword indexability verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Keyword indexability verified: ${actualMap.summary.keywordCount} keywords, ${actualMap.summary.targetCount} indexable targets, complete sitemap/prerender/canonical coverage, and no orphan owners.`);
