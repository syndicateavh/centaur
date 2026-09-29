#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { getBlogSitemapEntries } from '../src/content/blog/blogRoutes.js';
import { INDEXABLE_ROUTES } from '../src/seo/seoRoutes.js';
import { SITE_ORIGIN } from '../src/seo/siteConfig.js';
import {
  INDEXING_MANIFEST_FILE,
  INDEXING_SCHEMA_VERSION,
  validateIndexingManifest,
} from '../src/content/seo/indexingSchema.js';
import { loadBlogPosts } from './blog-storage.js';

const sitemapPath = path.resolve('public/sitemap.xml');
const outputPath = path.resolve(INDEXING_MANIFEST_FILE);

function decodeXml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'");
}

function readSitemapEntries() {
  if (!fs.existsSync(sitemapPath)) throw new Error('public/sitemap.xml is missing; run node tools/generate-sitemap.js first');
  const xml = fs.readFileSync(sitemapPath, 'utf8');
  return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/gi)].map((match) => ({
    url: decodeXml(match[1].match(/<loc>([\s\S]*?)<\/loc>/i)?.[1] || ''),
    lastModified: match[1].match(/<lastmod>([\s\S]*?)<\/lastmod>/i)?.[1] || null,
  }));
}

const routesByPath = new Map(INDEXABLE_ROUTES.map((route) => [route.path, route]));
const blogEntriesByPath = new Map(getBlogSitemapEntries(loadBlogPosts()).map((entry) => [entry.path, entry]));
const entries = readSitemapEntries();
const urls = entries.map(({ url, lastModified }) => {
  const parsed = new URL(url);
  if (parsed.origin !== SITE_ORIGIN) throw new Error(`Sitemap contains a URL outside the configured origin: ${url}`);
  const route = routesByPath.get(parsed.pathname);
  const blogEntry = blogEntriesByPath.get(parsed.pathname);
  if (!route && !blogEntry) throw new Error(`Sitemap URL is not represented by an indexable route or published blog entry: ${url}`);
  return {
    url,
    path: parsed.pathname,
    kind: route ? 'site-route' : blogEntry.kind === 'post' ? 'blog-article' : 'blog-category',
    routeId: route?.id || null,
    lastModified: lastModified || null,
    eligibility: 'sitemap',
  };
});

const manifest = {
  schemaVersion: INDEXING_SCHEMA_VERSION,
  siteOrigin: SITE_ORIGIN,
  sitemapUrl: `${SITE_ORIGIN}/sitemap.xml`,
  sourceFile: 'public/sitemap.xml',
  urlCount: urls.length,
  urls,
};
const errors = validateIndexingManifest(manifest);
if (errors.length > 0) {
  console.error(`Indexing manifest generation failed:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Generated indexing manifest: ${urls.length} canonical URLs in ${path.relative(process.cwd(), outputPath)}.`);
