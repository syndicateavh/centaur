#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { INDEXABLE_ROUTES } from '../src/seo/seoRoutes.js';
import { BLOG_IMAGES_ROOT, BLOG_POSTS_ROOT, listBlogPostFiles, readBlogPostFile } from './blog-storage.js';
import {
  BLOG_CATEGORIES,
  BLOG_FIELD_DEFINITIONS,
  BLOG_SCHEMA_VERSION,
  BLOG_STATUSES,
} from '../src/content/blog/blogSchema.js';
import { validateBlogCollectionForEditorialUse } from '../src/content/blog/blogValidation.js';

const blogRoot = path.resolve('src/content/blog');
const failures = [];

function fail(message) {
  failures.push(message);
}

if (!fs.existsSync(blogRoot)) {
  fail('blog content directory is missing: src/content/blog');
} else {
  const schemaPath = path.join(blogRoot, 'blogSchema.js');
  const readmePath = path.join(blogRoot, 'README.md');
  if (!fs.existsSync(schemaPath)) fail('blog content schema is missing: src/content/blog/blogSchema.js');
  if (!fs.existsSync(readmePath)) fail('blog content directory README is missing');
}

const posts = [];

if (fs.existsSync(blogRoot)) {
  const rootJsonFiles = fs.readdirSync(blogRoot).filter((file) => file.endsWith('.json'));
  for (const file of rootJsonFiles) fail(`blog content JSON must be stored under src/content/blog/posts/: ${file}`);
}

for (const filePath of listBlogPostFiles()) {
  const file = path.basename(filePath);
  try {
    const post = readBlogPostFile(filePath);
    if (path.dirname(filePath) !== BLOG_POSTS_ROOT) fail(`${file}: post is outside the canonical storage directory`);
    posts.push(post);
  } catch (error) {
    fail(`${file}: invalid JSON (${error.message})`);
  }
}

const routeIds = INDEXABLE_ROUTES.map((route) => route.id);
const availableImagePaths = new Set(
  fs.existsSync(BLOG_IMAGES_ROOT)
    ? fs.readdirSync(BLOG_IMAGES_ROOT).filter((file) => fs.statSync(path.join(BLOG_IMAGES_ROOT, file)).isFile()).map((file) => `/images/blog/${file}`)
    : [],
);
const validation = validateBlogCollectionForEditorialUse(posts, {
  mode: 'collection',
  validRouteIds: routeIds,
  validRoutePaths: INDEXABLE_ROUTES.map((route) => route.path),
  validRoutes: INDEXABLE_ROUTES,
  availableImagePaths,
});
for (const error of validation.errors) fail(error);
for (const warning of validation.warnings) console.warn(`Blog content warning: ${warning}`);

if (BLOG_SCHEMA_VERSION !== 1) fail(`unexpected blog schema version: ${BLOG_SCHEMA_VERSION}`);
if (BLOG_CATEGORIES.length === 0) fail('blog category registry must not be empty');
if (Object.keys(BLOG_STATUSES).length !== 5) fail('blog status registry must contain five editorial states');
if (BLOG_FIELD_DEFINITIONS.some((field) => !field.name || !field.type)) fail('blog field definitions contain an incomplete field');

if (failures.length > 0) {
  console.error(`Blog content structure verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Blog content structure verified: schema v${BLOG_SCHEMA_VERSION}, ${BLOG_FIELD_DEFINITIONS.length} fields, ${BLOG_CATEGORIES.length} categories, ${posts.length} content records, and ${validation.warnings.length} quality warnings.`);
