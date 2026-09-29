#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { ORGANIZATION_ID } from '../src/content/businessData.js';
import { APPROVED_CONTENT_SOURCE } from '../src/content/verifiedClaims.js';
import { HOME_SEO_ROUTE } from '../src/seo/homeSeo.js';
import {
  INDEXABLE_ROUTES,
  SEO_ROUTES,
  PRIMARY_COURSE_ID,
  canonicalUrl,
  createStructuredData,
} from '../src/seo/seoRoutes.js';

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
const blogPostFiles = fs.existsSync(path.resolve('src/content/blog/posts'))
  ? fs.readdirSync(path.resolve('src/content/blog/posts'))
    .filter((file) => file.endsWith('.json'))
    .map((file) => path.resolve('src/content/blog/posts', file))
  : [];
const activeSource = [...files, ...blogPostFiles].map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const approvedBundle = path.resolve(APPROVED_CONTENT_SOURCE.file);

if (/₹\s*\d|\bLPA\b/i.test(HOME_SEO_ROUTE.h1)) {
  failures.push('content: homepage H1 must not publish an unevidenced salary range');
}

if (!fs.existsSync(approvedBundle)) {
  failures.push(`content: approved original source is missing: ${APPROVED_CONTENT_SOURCE.file}`);
}

for (const requiredOriginalText of [
  'Bharat Singh',
  'Founder & Director',
  'Masterclass Modules & Career Directions',
  '100% Job Guarantee Program',
  'Centaur Careers Course Completion Certificate',
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

const forbiddenPlacementLanguage = /placement\s+guarantee|guaranteed\s+placement|guaranteed\s+interviews|placement\s+guaranteed|refund\s+guarantee|money-back\s+guarantee|100%\s+placement|assured\s+placement/i;
if (forbiddenPlacementLanguage.test(activeSource)) {
  failures.push('content: an unsupported guarantee variant remains in active source');
}

for (const requiredGuaranteeText of ['100% Job Guarantee Program', 'guarantees a finance job', 'Open to graduates and job switchers']) {
  if (!activeSource.includes(requiredGuaranteeText)) {
    failures.push(`content: required qualified job-guarantee wording is missing: ${requiredGuaranteeText}`);
  }
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
    const organization = graph.find((item) => item['@id'] === ORGANIZATION_ID);
    const webPage = graph.find((item) => item['@id'] === `${canonicalUrl(route)}#webpage`);
    if (!organization || organization['@type'] !== 'EducationalOrganization') {
      failures.push(`schema: ${route.path} is missing the EducationalOrganization entity`);
    }
    if (organization?.legalName !== 'Centaur Careers Private Limited') {
      failures.push(`schema: ${route.path} is missing the verified legal organization name`);
    }
    if (!webPage) failures.push(`schema: ${route.path} is missing its WebPage entity`);
    if (route.path !== '/' && !graph.some((item) => item['@type'] === 'BreadcrumbList')) {
      failures.push(`schema: ${route.path} is missing BreadcrumbList data`);
    }
    if (route.program && !graph.some((item) => item['@type'] === 'Course')) {
      failures.push(`schema: ${route.path} is missing Course data`);
    }
    if (route.trackId) {
      if (graph.some((item) => item['@type'] === 'Course')) {
        failures.push(`schema: ${route.path} must not publish standalone Course data for a module`);
      }
      if (!graph.some((item) => item['@type'] === 'LearningResource' && item['@id'] === `${canonicalUrl(route)}#learning-resource`)) {
        failures.push(`schema: ${route.path} is missing its LearningResource module entity`);
      }
    }
    if (route.program && !graph.some((item) => item['@id'] === PRIMARY_COURSE_ID)) {
      failures.push(`schema: ${route.path} is missing the persistent primary Course ID`);
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

console.log(`Source content verified: ${INDEXABLE_ROUTES.length} indexable routes, structured data and current approved-copy controls are configured.`);
