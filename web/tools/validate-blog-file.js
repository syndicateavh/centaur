#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { INDEXABLE_ROUTES } from '../src/seo/seoRoutes.js';
import { validateBlogPostForEditorialUse } from '../src/content/blog/blogValidation.js';
import { BLOG_STATUSES } from '../src/content/blog/blogSchema.js';
import { BLOG_IMAGES_ROOT } from './blog-storage.js';

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: npm run blog:validate-file -- <path-to-blog-json>');
  process.exit(1);
}

const resolvedPath = path.resolve(inputPath);
let post;
try {
  post = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
} catch (error) {
  console.error(`Blog JSON could not be read: ${error instanceof Error ? error.message : 'invalid JSON'}`);
  process.exit(1);
}

const availableImagePaths = new Set(
  fs.existsSync(BLOG_IMAGES_ROOT)
    ? fs.readdirSync(BLOG_IMAGES_ROOT, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => `/images/blog/${entry.name}`)
    : [],
);
const result = validateBlogPostForEditorialUse(post, {
  mode: post.status === BLOG_STATUSES.PUBLISHED ? 'publish' : 'draft',
  validRouteIds: INDEXABLE_ROUTES.map((route) => route.id),
  validRoutePaths: INDEXABLE_ROUTES.map((route) => route.path),
  validRoutes: INDEXABLE_ROUTES,
  availableImagePaths,
});

for (const warning of result.warnings) console.warn(`Blog file warning: ${warning}`);
if (result.errors.length > 0) {
  console.error(`Blog file validation failed for ${resolvedPath}:\n- ${result.errors.join('\n- ')}`);
  process.exit(1);
}

console.log(`Blog file validated: ${resolvedPath} (${result.metrics.wordCount} body words, ${result.warnings.length} warnings).`);
