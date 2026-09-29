#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { blogCategoryPath, getBlogSitemapEntries } from '../src/content/blog/blogRoutes.js';
import { loadBlogPosts, listBlogImageFiles } from './blog-storage.js';

const buildRoot = path.resolve('build/client');
const failures = [];

function fail(message) {
  failures.push(message);
}

function outputFile(publicPath) {
  return path.join(buildRoot, publicPath.slice(1), 'index.html');
}

function collectFiles(root) {
  if (!fs.existsSync(root)) return [];
  return fs.readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(root, entry.name);
    return entry.isDirectory() ? collectFiles(entryPath) : [entryPath];
  });
}

if (!fs.existsSync(buildRoot)) {
  fail('build/client is missing; run npm run build first');
} else {
  for (const relativePath of ['robots.txt', 'sitemap.xml']) {
    if (!fs.existsSync(path.join(buildRoot, relativePath))) fail(`build output is missing ${relativePath}`);
  }

  for (const filePath of listBlogImageFiles()) {
    const fileName = path.basename(filePath);
    if (fileName === '.gitkeep') continue;
    const buildFile = path.join(buildRoot, 'images', 'blog', fileName);
    if (!fs.existsSync(buildFile)) {
      fail(`build output is missing blog image: /images/blog/${fileName}`);
      continue;
    }
    if (!fs.readFileSync(filePath).equals(fs.readFileSync(buildFile))) {
      fail(`build output blog image differs from source: /images/blog/${fileName}`);
    }
  }

  const sourceImageNames = new Set(listBlogImageFiles().map((filePath) => path.basename(filePath)).filter((fileName) => fileName !== '.gitkeep'));
  for (const buildFile of collectFiles(path.join(buildRoot, 'images', 'blog'))) {
    const fileName = path.basename(buildFile);
    if (fileName === '.gitkeep') continue;
    if (!sourceImageNames.has(fileName)) fail(`build output contains a stale or unmanaged blog image: /images/blog/${fileName}`);
  }

  const blogPosts = loadBlogPosts();
  const blogEntries = getBlogSitemapEntries(blogPosts);
  for (const entry of blogEntries) {
    const filePath = outputFile(entry.path);
    if (!fs.existsSync(filePath)) fail(`build output is missing published blog document: ${entry.path}`);
  }

  const expectedBlogDocuments = new Set(['/blog/', ...blogEntries.map((entry) => entry.path)]);
  if (!blogPosts.some((post) => post.status === 'published' && post.category === 'industry-updates')) {
    expectedBlogDocuments.add(blogCategoryPath('industry-updates'));
  }
  for (const buildFile of collectFiles(path.join(buildRoot, 'blog'))) {
    if (path.basename(buildFile) !== 'index.html') continue;
    const relativePath = path.relative(buildRoot, buildFile).split(path.sep).join('/');
    const publicPath = `/${relativePath.slice(0, -'index.html'.length)}`;
    if (!expectedBlogDocuments.has(publicPath)) fail(`build output contains a stale or unmanaged blog document: ${publicPath}`);
  }

  if (fs.existsSync(path.join(buildRoot, '__spa-fallback.html'))) fail('build output contains the unused SPA fallback');
}

if (failures.length > 0) {
  console.error(`Blog build output verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

const imageCount = listBlogImageFiles().filter((filePath) => path.basename(filePath) !== '.gitkeep').length;
const blogRouteCount = getBlogSitemapEntries(loadBlogPosts()).length;
console.log(`Blog build output verified: ${imageCount} blog images and ${blogRouteCount} published blog documents are present in build/client.`);
