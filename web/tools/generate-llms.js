#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { BLOG_CATEGORIES, BLOG_STATUSES } from '../src/content/blog/blogSchema.js';
import { blogCategoryLabel, blogCategoryPath, blogPostPath, getPublishedBlogPostsSorted } from '../src/content/blog/blogRoutes.js';
import { getBlogCategoryKeywordOwnership, getBlogKeywordOwnership } from '../src/content/seo/blogKeywordOwnership.js';
import { INDEXABLE_ROUTES } from '../src/seo/seoRoutes.js';
import { createLlmsDocument } from '../src/seo/llms.js';
import { loadBlogPosts } from './blog-storage.js';

export function getLlmsBlogEntries(posts = []) {
  const publishedPosts = getPublishedBlogPostsSorted(posts);
  const categories = [...new Set(publishedPosts.map((post) => post.category))]
    .filter((category) => BLOG_CATEGORIES.includes(category))
    .sort()
    .map((category) => {
      const categoryPosts = publishedPosts.filter((post) => post.category === category);
      const lastModified = categoryPosts
        .map((post) => post.updatedAt || post.publishedAt)
        .sort()
        .at(-1);
      const label = blogCategoryLabel(category);
      return {
        path: blogCategoryPath(category),
        title: label + ' | Centaur Careers Blog',
        description: 'Published Centaur Careers articles and resources about ' + label.toLowerCase() + '.',
        lastModified,
        primaryKeyword: getBlogCategoryKeywordOwnership(category)?.primaryKeyword || null,
        secondaryKeywords: getBlogCategoryKeywordOwnership(category)?.secondaryKeywords || [],
      };
    });

  return [
    ...categories,
    ...publishedPosts
      .filter((post) => post.status === BLOG_STATUSES.PUBLISHED)
      .map((post) => ({
        path: blogPostPath(post.slug),
        title: post.seo?.title || post.title,
        description: post.seo?.description || post.excerpt,
        lastModified: post.updatedAt || post.publishedAt,
        primaryKeyword: getBlogKeywordOwnership(post)?.primaryKeyword || null,
        secondaryKeywords: getBlogKeywordOwnership(post)?.secondaryKeywords || [],
      })),
  ];
}

export function createLlmsContent() {
  return createLlmsDocument({
    routes: INDEXABLE_ROUTES,
    blogEntries: getLlmsBlogEntries(loadBlogPosts()),
  });
}

export function writeLlmsFile(outputPath = path.resolve('public/llms.txt')) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const content = createLlmsContent();
  fs.writeFileSync(outputPath, content, 'utf8');
  return content;
}

if (import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const outputPath = path.resolve('public/llms.txt');
  const content = writeLlmsFile(outputPath);
  const urlCount = (content.match(/^[-] \[/gm) || []).length;
  console.log('Generated llms.txt with ' + urlCount + ' canonical page entries.');
}
