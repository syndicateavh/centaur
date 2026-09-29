#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { INDEXABLE_ROUTES, SITE_ORIGIN, canonicalUrl } from '../src/seo/seoRoutes.js';
import { getBlogSitemapEntries } from '../src/content/blog/blogRoutes.js';
import { loadBlogPosts } from './blog-storage.js';

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

const blogEntries = getBlogSitemapEntries(loadBlogPosts());
const currentSiteDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
const sitemapEntries = [
  ...INDEXABLE_ROUTES.map((route) => ({ path: canonicalUrl(route), lastModified: route.lastModified })),
  ...blogEntries.map((entry) => ({ path: `${SITE_ORIGIN}${entry.path}`, lastModified: entry.lastModified })),
];

const urls = sitemapEntries.map((entry) => {
  if (entry.lastModified) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.lastModified)) {
      throw new Error(`Invalid lastModified date for ${entry.path}: ${entry.lastModified}`);
    }

    const lastModifiedTime = Date.parse(`${entry.lastModified}T00:00:00Z`);
    if (Number.isNaN(lastModifiedTime) || entry.lastModified > currentSiteDate) {
      throw new Error(`lastModified must be a valid non-future date for ${entry.path}: ${entry.lastModified}`);
    }
  }

  const lastModified = entry.lastModified ? `\n    <lastmod>${entry.lastModified}</lastmod>` : '';
  return `  <url>\n    <loc>${escapeXml(entry.path)}</loc>${lastModified}\n  </url>`;
}).join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

const outputPath = path.resolve('public/sitemap.xml');
fs.writeFileSync(outputPath, sitemap, 'utf8');
console.log(`Generated sitemap with ${sitemapEntries.length} canonical URLs.`);
