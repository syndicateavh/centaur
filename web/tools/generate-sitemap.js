#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { INDEXABLE_ROUTES, canonicalUrl } from '../src/seo/seoRoutes.js';

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

const urls = INDEXABLE_ROUTES.map((route) => {
  const lastModified = route.lastModified ? `\n    <lastmod>${route.lastModified}</lastmod>` : '';
  return `  <url>\n    <loc>${escapeXml(canonicalUrl(route))}</loc>${lastModified}\n  </url>`;
}).join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

const outputPath = path.resolve('public/sitemap.xml');
fs.writeFileSync(outputPath, sitemap, 'utf8');
console.log(`Generated sitemap with ${INDEXABLE_ROUTES.length} canonical URLs.`);
