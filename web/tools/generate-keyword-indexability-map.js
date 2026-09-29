#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { createKeywordIndexabilityMap } from '../src/seo/keywordIndexability.js';
import { SEO_ROUTES } from '../src/seo/seoRoutes.js';

const buildRoot = path.resolve('build/client');
const outputPath = path.resolve('docs/seo-keyword-indexability-map.json');

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

if (!fs.existsSync(buildRoot)) {
  console.error('Keyword-indexability map generation requires a current build. Run npm run build first.');
  process.exit(1);
}

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

const map = createKeywordIndexabilityMap({
  available: true,
  sitemapUrls,
  prerenderedByPath,
  renderedCanonicalByPath,
});

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(map, null, 2)}\n`, 'utf8');

console.log(`Generated keyword-indexability map: ${map.summary.keywordCount} keywords across ${map.summary.targetCount} targets.`);
console.log(`Audited targets: ${map.summary.sitemapIncludedTargetCount}/${map.summary.targetCount} in sitemap and ${map.summary.prerenderedTargetCount}/${map.summary.targetCount} prerendered.`);
