#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { INDEXABLE_ROUTES, SEO_ROUTES, createStructuredData } from '../src/seo/seoRoutes.js';
import { VERIFIED_PUBLIC_CLAIMS } from '../src/content/verifiedClaims.js';

const sourceRoots = [
  path.resolve('src/components'),
  path.resolve('src/content'),
  path.resolve('src/pages'),
  path.resolve('src/routes'),
  path.resolve('src/seo'),
];
const standaloneFiles = [path.resolve('src/root.jsx'), path.resolve('src/routes.js'), path.resolve('src/index.css')];
const failures = [];

function sourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const itemPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(itemPath);
    return /\.(?:js|jsx|css)$/.test(entry.name) ? [itemPath] : [];
  });
}

const files = [...sourceRoots.flatMap(sourceFiles), ...standaloneFiles];
const activeSource = files.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const restrictedPatterns = [
  [/100%\s+placement/i, 'unsupported placement guarantee'],
  [/500\+\s+(?:students\s+)?trained/i, 'unsupported learner total'],
  [/₹\s*3\s*[–-]\s*12\s*LPA/i, 'unsupported salary range'],
  [/100%\s+fee\s+refund/i, 'unsupported fee-refund guarantee'],
  [/105\+\s+(?:finance\s+)?roles/i, 'unsupported role total'],
];

for (const [pattern, label] of restrictedPatterns) {
  if (pattern.test(activeSource)) failures.push(`content: found ${label}`);
}

for (const forbiddenOrigin of [
  'horizons-cdn.hostinger.com',
  'fonts.googleapis.com',
  'analytics.ahrefs.com',
]) {
  if (activeSource.includes(forbiddenOrigin)) failures.push(`performance: active source still references ${forbiddenOrigin}`);
}

if (VERIFIED_PUBLIC_CLAIMS.length !== 0) {
  failures.push('claims: verified claim registry must remain empty until evidence review is completed');
}

if (INDEXABLE_ROUTES.length < 10) {
  failures.push(`routes: expected at least 10 indexable routes, found ${INDEXABLE_ROUTES.length}`);
}

for (const route of SEO_ROUTES) {
  const schema = createStructuredData(route);
  if (route.indexable && !schema) failures.push(`schema: ${route.path} has no structured data`);
  if (!route.indexable && schema) failures.push(`schema: non-indexable ${route.path} should not publish structured data`);

  if (schema) {
    const graph = schema['@graph'];
    const organization = graph.find((item) => Array.isArray(item['@type']) && item['@type'].includes('LocalBusiness'));
    const webPage = graph.find((item) => item['@id'] === `${route.path === '/' ? 'https://centaurcareers.in/' : `https://centaurcareers.in${route.path}`}#webpage`);
    if (!organization) failures.push(`schema: ${route.path} is missing the organization/local-business entity`);
    if (!webPage) failures.push(`schema: ${route.path} is missing its WebPage entity`);
    if (route.path !== '/' && !graph.some((item) => item['@type'] === 'BreadcrumbList')) {
      failures.push(`schema: ${route.path} is missing BreadcrumbList data`);
    }
    if (route.courseId && !graph.some((item) => item['@type'] === 'Course')) {
      failures.push(`schema: ${route.path} is missing Course data`);
    }
    if (route.id === 'faqs' && (!Array.isArray(webPage?.mainEntity) || webPage.mainEntity.length === 0)) {
      failures.push('schema: FAQ page is missing visible question entities');
    }
  }
}

const htaccess = fs.readFileSync(path.resolve('public/.htaccess'), 'utf8');
if (/HTTP_REFERER/i.test(htaccess)) failures.push('assets: .htaccess must not gate public assets by Referer');
if (!/Require all granted/i.test(htaccess)) failures.push('assets: .htaccess does not explicitly allow public static files');

const gtmOccurrences = (activeSource.match(/googletagmanager\.com\/gtm\.js/g) || []).length;
if (gtmOccurrences !== 1) failures.push(`analytics: expected one GTM loader, found ${gtmOccurrences}`);

if (failures.length > 0) {
  console.error(`Source content verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Source content verified: ${INDEXABLE_ROUTES.length} indexable routes, structured data, local critical assets and restricted-claim controls are configured.`);
