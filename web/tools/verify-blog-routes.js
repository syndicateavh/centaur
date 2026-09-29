#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { getBlogSitemapEntries, blogCategoryLabel, blogCategoryPath, blogPostPath } from '../src/content/blog/blogRoutes.js';
import { loadBlogPosts } from './blog-storage.js';

const buildRoot = path.resolve('build/client');
const failures = [];
const publishedPosts = loadBlogPosts().filter((post) => post.status === 'published');

function fail(message) {
  failures.push(message);
}

function outputFile(publicPath) {
  return path.join(buildRoot, publicPath.slice(1), 'index.html');
}

function decodeHtml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#x27;', "'")
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function readPage(publicPath) {
  const file = outputFile(publicPath);
  if (!fs.existsSync(file)) {
    fail(`${publicPath}: missing ${path.relative(process.cwd(), file)}`);
    return '';
  }
  return decodeHtml(fs.readFileSync(file, 'utf8'));
}

function hasHeading(html, level, text) {
  const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`<h${level}\\b[^>]*>${escapedText}</h${level}>`, 'i').test(html);
}

function verifyImage(html, image, publicPath, loading) {
  if (!image?.src) return;
  const escapedSource = image.src.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const imageTag = html.match(new RegExp(`<img\\b[^>]*src="${escapedSource}"[^>]*>`, 'i'))?.[0];
  if (!imageTag) {
    fail(`${publicPath}: image is missing from the rendered article: ${image.src}`);
    return;
  }
  if (!imageTag.includes(`alt="${image.alt}"`)) fail(`${publicPath}: image alt text does not match the post record: ${image.src}`);
  if (!imageTag.includes(`width="${image.width}"`) || !imageTag.includes(`height="${image.height}"`)) fail(`${publicPath}: image dimensions do not match the post record: ${image.src}`);
  if (!imageTag.includes(`loading="${loading}"`)) fail(`${publicPath}: image loading mode should be ${loading}: ${image.src}`);
  if (!imageTag.includes('decoding="async"')) fail(`${publicPath}: image decoding mode is missing: ${image.src}`);
}

for (const post of publishedPosts) {
  const publicPath = blogPostPath(post.slug);
  const html = readPage(publicPath);
  if (!html) continue;
  const canonical = `https://centaurcareers.in${post.seo.canonicalPath || publicPath}`;
  if (!html.includes(`<title>${post.seo.title}</title>`)) fail(`${publicPath}: title does not match the post SEO title`);
  if (!html.includes(`name="description" content="${post.seo.description}"`)) fail(`${publicPath}: description does not match the post SEO description`);
  if (!html.includes(`name="robots" content="index,follow"`)) fail(`${publicPath}: published post is not indexable`);
  if (!html.includes(`rel="canonical" href="${canonical}"`)) fail(`${publicPath}: canonical does not match the post record`);
  if (!hasHeading(html, 1, post.title)) fail(`${publicPath}: article H1 is missing`);
  if (!html.includes('"@type":"BlogPosting"') && !html.includes('"@type": "BlogPosting"')) fail(`${publicPath}: BlogPosting structured data is missing`);
  if (!html.includes(`"@id":"${canonical}#breadcrumb"`) && !html.includes(`"@id": "${canonical}#breadcrumb"`)) fail(`${publicPath}: breadcrumb structured data is missing`);
  if (!html.includes('"@id":"https://centaurcareers.in/#organization"') && !html.includes('"@id": "https://centaurcareers.in/#organization"')) fail(`${publicPath}: shared organization entity is missing`);
  if (!html.includes('"@id":"https://centaurcareers.in/#website"') && !html.includes('"@id": "https://centaurcareers.in/#website"')) fail(`${publicPath}: shared website entity is missing`);
  verifyImage(html, post.coverImage, publicPath, 'eager');
  for (const block of post.body || []) {
    if (block.type === 'image') verifyImage(html, block.image, publicPath, 'lazy');
  }
}

for (const category of [...new Set(publishedPosts.map((post) => post.category))].sort()) {
  const publicPath = blogCategoryPath(category);
  const html = readPage(publicPath);
  if (!html) continue;
  const label = blogCategoryLabel(category);
  if (!html.includes(`<title>${label} | Centaur Careers Blog</title>`)) fail(`${publicPath}: category title is missing`);
  if (!html.includes(`rel="canonical" href="https://centaurcareers.in${publicPath}"`)) fail(`${publicPath}: category canonical is missing`);
  if (!html.includes('name="robots" content="index,follow"')) fail(`${publicPath}: category is not indexable`);
  if (!hasHeading(html, 1, `${label} articles`)) fail(`${publicPath}: category H1 is missing`);
  if (!html.includes('"@type":"CollectionPage"') && !html.includes('"@type": "CollectionPage"')) fail(`${publicPath}: CollectionPage structured data is missing`);
}

if (!publishedPosts.some((post) => post.category === 'industry-updates')) {
  const publicPath = blogCategoryPath('industry-updates');
  const html = readPage(publicPath);
  if (html) {
    if (!html.includes('<title>Industry Updates | Centaur Careers Blog</title>')) fail(`${publicPath}: editorial category title is missing`);
    if (!html.includes(`rel="canonical" href="https://centaurcareers.in${publicPath}"`)) fail(`${publicPath}: editorial category canonical is missing`);
    if (!html.includes('name="robots" content="noindex,follow"')) fail(`${publicPath}: unpublished editorial archive must remain noindex`);
    if (!hasHeading(html, 1, 'Finance Industry Updates')) fail(`${publicPath}: empty editorial category H1 is missing`);
    if (!html.includes('The first explainer is under editorial review')) fail(`${publicPath}: editorial review state is not visible`);
    const sitemap = fs.existsSync(path.resolve('public/sitemap.xml')) ? fs.readFileSync(path.resolve('public/sitemap.xml'), 'utf8') : '';
    if (sitemap.includes(`https://centaurcareers.in${publicPath}`)) fail(`${publicPath}: empty editorial category must not appear in the sitemap`);
  }
}

const sitemapEntries = getBlogSitemapEntries(publishedPosts);
for (const entry of sitemapEntries) {
  const sitemap = fs.existsSync(path.resolve('public/sitemap.xml')) ? fs.readFileSync(path.resolve('public/sitemap.xml'), 'utf8') : '';
  if (!sitemap.includes(`https://centaurcareers.in${entry.path}`)) fail(`sitemap: missing published blog URL ${entry.path}`);
}

if (failures.length > 0) {
  console.error(`Blog public route verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Blog public routes verified: ${publishedPosts.length} published articles and ${new Set(publishedPosts.map((post) => post.category)).size} published category archives.`);
