#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { BLOG_CATEGORIES } from '../src/content/blog/blogSchema.js';
import { blogCategoryPath, blogPostPath, getPublishedBlogPostsSorted } from '../src/content/blog/blogRoutes.js';
import { getBlogCategoryKeywordOwnership, getBlogKeywordOwnership } from '../src/content/seo/blogKeywordOwnership.js';
import { loadBlogPosts } from './blog-storage.js';
import { getKeywordOwnership } from '../src/seo/keywordMap.js';
import { INDEXABLE_ROUTES, SITE_ORIGIN } from '../src/seo/seoRoutes.js';

function routeRecord(route) {
  const ownership = getKeywordOwnership(route.keywordOwnerUrl || route.path);
  return {
    kind: 'site-route',
    id: route.id,
    path: route.path,
    canonicalUrl: `${SITE_ORIGIN}${route.path}`,
    primaryKeyword: route.primaryKeyword,
    secondaryKeywords: ownership?.secondaryKeywords || [],
    keywordPurpose: route.keywordPurpose,
    lastModified: route.lastModified || null,
  };
}

function blogCategoryRecords(posts) {
  return [...new Set(posts.map((post) => post.category))]
    .filter((category) => BLOG_CATEGORIES.includes(category))
    .sort()
    .map((category) => {
      const ownership = getBlogCategoryKeywordOwnership(category);
      const categoryPosts = posts.filter((post) => post.category === category);
      return {
        kind: 'blog-category',
        id: `blog-category-${category}`,
        path: blogCategoryPath(category),
        canonicalUrl: `${SITE_ORIGIN}${blogCategoryPath(category)}`,
        primaryKeyword: ownership?.primaryKeyword || null,
        secondaryKeywords: ownership?.secondaryKeywords || [],
        keywordPurpose: 'Published article category archive',
        lastModified: categoryPosts.map((post) => post.updatedAt || post.publishedAt).sort().at(-1) || null,
      };
    });
}

function blogPostRecords(posts) {
  return getPublishedBlogPostsSorted(posts).map((post) => {
    const ownership = getBlogKeywordOwnership(post);
    return {
      kind: 'blog-article',
      id: post.id,
      path: blogPostPath(post.slug),
      canonicalUrl: `${SITE_ORIGIN}${blogPostPath(post.slug)}`,
      primaryKeyword: ownership?.primaryKeyword || null,
      secondaryKeywords: ownership?.secondaryKeywords || [],
      keywordPurpose: 'Published first-party finance education article',
      lastModified: post.updatedAt || post.publishedAt || null,
    };
  });
}

export function createPageKeywordMap(posts = loadBlogPosts()) {
  const publishedPosts = getPublishedBlogPostsSorted(posts);
  const pages = [
    ...INDEXABLE_ROUTES.map(routeRecord),
    ...blogCategoryRecords(publishedPosts),
    ...blogPostRecords(publishedPosts),
  ];

  return {
    schemaVersion: 1,
    source: {
      country: 'IN',
      language: 'en-IN',
      routeRegistry: 'src/seo/seoRoutes.js',
      blogKeywordMap: 'src/content/seo/blogKeywordOwnership.js',
    },
    summary: {
      pageCount: pages.length,
      siteRouteCount: pages.filter((page) => page.kind === 'site-route').length,
      blogCategoryCount: pages.filter((page) => page.kind === 'blog-category').length,
      blogArticleCount: pages.filter((page) => page.kind === 'blog-article').length,
      pagesWithPrimaryKeyword: pages.filter((page) => page.primaryKeyword).length,
    },
    pages,
  };
}

const outputPath = path.resolve('docs/seo-page-keyword-map.json');
const pageKeywordMap = createPageKeywordMap();
fs.writeFileSync(outputPath, `${JSON.stringify(pageKeywordMap, null, 2)}\n`, 'utf8');
console.log(`Generated page keyword map: ${pageKeywordMap.summary.pageCount} public pages in ${path.relative(process.cwd(), outputPath)}.`);
