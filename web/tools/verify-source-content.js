#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { APPROVED_CONTENT_SOURCE } from '../src/content/verifiedClaims.js';
import { INDEXABLE_ROUTES, SEO_ROUTES, createStructuredData } from '../src/seo/seoRoutes.js';

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
const approvedBundle = path.resolve(APPROVED_CONTENT_SOURCE.file);

if (!fs.existsSync(approvedBundle)) {
  failures.push(`content: approved original source is missing: ${APPROVED_CONTENT_SOURCE.file}`);
}

for (const requiredOriginalText of [
  'Bharat Singh',
  'Founder & Director',
  'Finance Career Tracks We Offer',
  'Placement Guarantee & Student Promise',
  'Receive an Industry-Recognized Certificate',
]) {
  if (!activeSource.includes(requiredOriginalText)) {
    failures.push(`content: missing original source wording: ${requiredOriginalText}`);
  }
}

for (const forbiddenOrigin of [
  'horizons-cdn.hostinger.com',
  'fonts.googleapis.com',
  'analytics.ahrefs.com',
]) {
  if (activeSource.includes(forbiddenOrigin)) failures.push(`performance: active source still references ${forbiddenOrigin}`);
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
    if (route.program && !graph.some((item) => item['@type'] === 'Course')) {
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

console.log(`Source content verified: ${INDEXABLE_ROUTES.length} indexable routes, structured data and approved original-content controls are configured.`);
