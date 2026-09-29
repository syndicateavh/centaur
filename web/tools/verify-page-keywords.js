#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { blogCategoryPath, blogPostPath, getPublishedBlogPostsSorted } from '../src/content/blog/blogRoutes.js';
import { getBlogCategoryKeywordOwnership, getBlogKeywordOwnership } from '../src/content/seo/blogKeywordOwnership.js';
import { loadBlogPosts } from './blog-storage.js';
import { getKeywordOwnership } from '../src/seo/keywordMap.js';
import { INDEXABLE_ROUTES } from '../src/seo/seoRoutes.js';

const failures = [];
const warnings = [];

function fail(message) {
  failures.push(message);
}

function normalize(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

const routePrimaryOwners = new Map();
for (const route of INDEXABLE_ROUTES) {
  if (!route.primaryKeyword) fail(`${route.path}: indexable route is missing a primary keyword`);
  if (!route.keywordPurpose) fail(`${route.path}: indexable route is missing a keyword purpose`);

  const normalized = normalize(route.primaryKeyword);
  const existing = routePrimaryOwners.get(normalized);
  if (existing && existing.path !== route.path) {
    fail(`route primary keyword is owned by both ${existing.path} and ${route.path}: ${route.primaryKeyword}`);
  } else if (normalized) {
    routePrimaryOwners.set(normalized, route);
  }

  if (route.keywordOwnerUrl) {
    const ownership = getKeywordOwnership(route.keywordOwnerUrl);
    if (!ownership) fail(`${route.path}: keywordOwnerUrl is not present in the governed keyword map: ${route.keywordOwnerUrl}`);
    else if (normalize(ownership.primaryKeyword) !== normalized) {
      fail(`${route.path}: route primary keyword does not match its keyword owner: ${route.primaryKeyword}`);
    }
  }
}

const posts = getPublishedBlogPostsSorted(loadBlogPosts());
const blogPrimaryOwners = new Map();
for (const post of posts) {
  const ownership = getBlogKeywordOwnership(post);
  if (!ownership?.primaryKeyword) {
    fail(`/blog/${post.slug}/: published article is missing a primary keyword or governed override`);
    continue;
  }

  const normalized = normalize(ownership.primaryKeyword);
  const existing = blogPrimaryOwners.get(normalized);
  if (existing && existing.slug !== post.slug) {
    fail(`blog primary keyword is owned by both /blog/${existing.slug}/ and /blog/${post.slug}/: ${ownership.primaryKeyword}`);
  } else {
    blogPrimaryOwners.set(normalized, post);
  }

  if (ownership.secondaryKeywords.length > 8) {
    warnings.push(`/blog/${post.slug}/ has more than eight secondary keywords; keep the visible page focused`);
  }
}

const publishedCategories = [...new Set(posts.map((post) => post.category))].sort();
for (const category of publishedCategories) {
  if (!getBlogCategoryKeywordOwnership(category)?.primaryKeyword) {
    fail(`${blogCategoryPath(category)}: published category archive is missing a primary keyword`);
  }
}

const llmsPath = path.resolve('public/llms.txt');
if (!fs.existsSync(llmsPath)) {
  fail('public/llms.txt is missing; run npm run seo:llms:generate');
} else {
  const llms = fs.readFileSync(llmsPath, 'utf8').toLowerCase();
  for (const route of INDEXABLE_ROUTES) {
    if (!llms.includes(`primary keyword: ${normalize(route.primaryKeyword)}`)) {
      fail(`${route.path}: primary keyword is not exposed in public/llms.txt`);
    }
  }
  for (const post of posts) {
    const ownership = getBlogKeywordOwnership(post);
    if (ownership && !llms.includes(`primary keyword: ${normalize(ownership.primaryKeyword)}`)) {
      fail(`/blog/${post.slug}/: primary keyword is not exposed in public/llms.txt`);
    }
  }
  for (const category of publishedCategories) {
    const ownership = getBlogCategoryKeywordOwnership(category);
    if (ownership && !llms.includes(`primary keyword: ${normalize(ownership.primaryKeyword)}`)) {
      fail(`${blogCategoryPath(category)}: primary keyword is not exposed in public/llms.txt`);
    }
  }
}

const mapPath = path.resolve('docs/seo-page-keyword-map.json');
if (!fs.existsSync(mapPath)) {
  fail('docs/seo-page-keyword-map.json is missing; run npm run seo:page-keywords:map');
} else {
  let pageMap = null;
  try {
    pageMap = JSON.parse(fs.readFileSync(mapPath, 'utf8'));
  } catch (error) {
    fail(`docs/seo-page-keyword-map.json is not valid JSON: ${error.message}`);
  }

  if (pageMap) {
    const pagesByPath = new Map((pageMap.pages || []).map((page) => [page.path, page]));
    const expectedPages = [
      ...INDEXABLE_ROUTES.map((route) => ({ path: route.path, primaryKeyword: route.primaryKeyword })),
      ...publishedCategories.map((category) => ({ path: blogCategoryPath(category), primaryKeyword: getBlogCategoryKeywordOwnership(category)?.primaryKeyword })),
      ...posts.map((post) => ({ path: blogPostPath(post.slug), primaryKeyword: getBlogKeywordOwnership(post)?.primaryKeyword })),
    ];
    if (pageMap.summary?.pageCount !== expectedPages.length) fail(`page keyword map count is ${pageMap.summary?.pageCount}; expected ${expectedPages.length}`);
    for (const expected of expectedPages) {
      const actual = pagesByPath.get(expected.path);
      if (!actual) fail(`${expected.path}: page keyword map entry is missing`);
      else if (normalize(actual.primaryKeyword) !== normalize(expected.primaryKeyword)) fail(`${expected.path}: page keyword map primary keyword is stale`);
    }
  }
}

if (failures.length > 0) {
  console.error(`Page keyword verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

for (const warning of warnings) console.warn(`Keyword warning: ${warning}`);
console.log(`Page keywords verified: ${INDEXABLE_ROUTES.length} indexable site routes and ${posts.length} published blog articles have one primary search owner and LLM-readable intent signals.`);
