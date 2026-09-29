#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { SEO_ROUTES } from '../src/seo/seoRoutes.js';
import { BLOG_PORTAL_API_PREFIX, BLOG_PORTAL_PATH } from '../src/content/blog/portalConfig.js';

const requiredFiles = [
  'src/pages/BlogPortalPage.jsx',
  'src/routes/blog-portal.jsx',
  'plugins/blog-portal-api.js',
  'src/content/blog/portalConfig.js',
];
const failures = [];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.resolve(file))) failures.push(`missing blog portal file: ${file}`);
}

if (SEO_ROUTES.some((route) => route.path === BLOG_PORTAL_PATH)) failures.push('blog portal must not be part of the public SEO route registry');
if (!BLOG_PORTAL_API_PREFIX.startsWith('/__local/')) failures.push('blog portal API must remain under the local-only prefix');

const portalPage = fs.existsSync(path.resolve('src/pages/BlogPortalPage.jsx'))
  ? fs.readFileSync(path.resolve('src/pages/BlogPortalPage.jsx'), 'utf8')
  : '';
const portalRoute = fs.existsSync(path.resolve('src/routes/blog-portal.jsx'))
  ? fs.readFileSync(path.resolve('src/routes/blog-portal.jsx'), 'utf8')
  : '';
const apiPlugin = fs.existsSync(path.resolve('plugins/blog-portal-api.js'))
  ? fs.readFileSync(path.resolve('plugins/blog-portal-api.js'), 'utf8')
  : '';

for (const [source, required, label] of [
  [portalPage, ['Import JSON', 'Export JSON', 'validateBlogPost', 'noindex', 'Controlled status actions', 'transitionWorkflow', 'getWorkflowTransitions'], 'portal editor'],
  [portalRoute, ['noindex', 'BlogPortalPage'], 'portal route'],
  [apiPlugin, ['apply: \'serve\'', 'isLoopbackRequest', 'writeBlogPostFile', 'writeBlogImageFile', 'BLOG_IMAGE_MAX_BYTES', 'saveImage', 'transitionBlogPost', '/workflow'], 'local portal API'],
]) {
  for (const text of required) if (!source.includes(text)) failures.push(`${label} is missing required control: ${text}`);
}

if (failures.length > 0) {
  console.error(`Blog portal verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log('Blog portal verified: local-only route, schema validation, JSON import/export, file save API, and image storage controls are configured.');
