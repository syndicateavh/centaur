#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { isBlogImagePath, blogImagePublicPath } from '../src/content/blog/imageConfig.js';
import { loadBlogPosts, listBlogImageFiles } from './blog-storage.js';
import { inspectBlogImage } from './blog-image.js';

const failures = [];
const warnings = [];
const imagesByPath = new Map();
const referencedImages = new Map();

function fail(message) {
  failures.push(message);
}

for (const filePath of listBlogImageFiles()) {
  const fileName = path.basename(filePath);
  if (fileName === '.gitkeep') continue;
  try {
    const metadata = inspectBlogImage(fs.readFileSync(filePath), fileName);
    const publicPath = blogImagePublicPath(fileName);
    imagesByPath.set(publicPath, metadata);
  } catch (error) {
    fail(`${fileName}: ${error instanceof Error ? error.message : 'invalid image file'}`);
  }
}

function collectImage(image, source) {
  if (!image) return;
  if (!isBlogImagePath(image.src)) {
    fail(`${source}.src must use a valid local image path under /images/blog/`);
    return;
  }
  referencedImages.set(image.src, { ...image, source });
}

for (const post of loadBlogPosts()) {
  collectImage(post.coverImage, `${post.id || 'unknown'}.coverImage`);
  for (const [index, block] of (post.body || []).entries()) {
    if (block?.type === 'image') collectImage(block.image, `${post.id || 'unknown'}.body[${index}].image`);
  }
}

for (const [publicPath, image] of referencedImages) {
  const metadata = imagesByPath.get(publicPath);
  if (!metadata) {
    fail(`${image.source}.src does not have a validated file in public/images/blog/: ${publicPath}`);
    continue;
  }
  if (Number(image.width) !== metadata.width || Number(image.height) !== metadata.height) {
    fail(`${image.source} dimensions ${image.width}x${image.height} do not match the stored image ${metadata.width}x${metadata.height}`);
  }
}

for (const publicPath of imagesByPath.keys()) {
  if (!referencedImages.has(publicPath)) warnings.push(`unused blog image: ${publicPath}`);
}

for (const warning of warnings) console.warn(`Blog image warning: ${warning}`);

if (failures.length > 0) {
  console.error(`Blog image verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Blog images verified: ${imagesByPath.size} stored images, ${referencedImages.size} referenced images, and ${warnings.length} warnings.`);
