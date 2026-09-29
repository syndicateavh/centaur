#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import {
  BLOG_POST_FILE_EXTENSION,
  BLOG_IMAGES_PUBLIC_PATH,
  BLOG_POSTS_DIRECTORY,
  BLOG_IMAGES_DIRECTORY,
} from '../src/content/blog/storageConfig.js';
import { normalizeBlogImageName } from '../src/content/blog/imageConfig.js';
import { assertValidBlogPost, validateBlogPost } from '../src/content/blog/blogSchema.js';
import { validateBlogPostForEditorialUse } from '../src/content/blog/blogValidation.js';
import { inspectBlogImage } from './blog-image.js';

const toolDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(toolDirectory, '..');

export const BLOG_POSTS_ROOT = path.resolve(projectRoot, BLOG_POSTS_DIRECTORY);
export const BLOG_IMAGES_ROOT = path.resolve(projectRoot, BLOG_IMAGES_DIRECTORY);

function assertSafePostId(id) {
  if (typeof id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    throw new Error(`Invalid blog post id for file storage: ${id}`);
  }
}

export function ensureBlogStorageDirectories() {
  fs.mkdirSync(BLOG_POSTS_ROOT, { recursive: true });
  fs.mkdirSync(BLOG_IMAGES_ROOT, { recursive: true });
}

export function blogPostFilePath(id) {
  assertSafePostId(id);
  return path.join(BLOG_POSTS_ROOT, `${id}${BLOG_POST_FILE_EXTENSION}`);
}

export function listBlogPostFiles() {
  ensureBlogStorageDirectories();
  return fs.readdirSync(BLOG_POSTS_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(BLOG_POST_FILE_EXTENSION))
    .map((entry) => path.join(BLOG_POSTS_ROOT, entry.name))
    .sort();
}

export function listBlogImageFiles() {
  ensureBlogStorageDirectories();
  return fs.readdirSync(BLOG_IMAGES_ROOT, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(BLOG_IMAGES_ROOT, entry.name))
    .sort();
}

export function blogImageFilePath(name) {
  const safeName = normalizeBlogImageName(name);
  const destination = path.resolve(BLOG_IMAGES_ROOT, safeName);
  if (!destination.startsWith(`${BLOG_IMAGES_ROOT}${path.sep}`)) throw new Error('Invalid blog image path');
  return destination;
}

export function writeBlogImageFile(name, contents) {
  ensureBlogStorageDirectories();
  const requestedName = normalizeBlogImageName(name);
  const metadata = inspectBlogImage(contents, requestedName);
  let destinationName = requestedName;
  let destination = blogImageFilePath(destinationName);

  if (fs.existsSync(destination)) {
    const existing = fs.readFileSync(destination);
    if (crypto.timingSafeEqual(crypto.createHash('sha256').update(existing).digest(), Buffer.from(metadata.sha256, 'hex'))) {
      return metadata;
    }
    const extension = requestedName.slice(requestedName.lastIndexOf('.'));
    const base = requestedName.slice(0, requestedName.lastIndexOf('.'));
    destinationName = `${base}-${metadata.sha256.slice(0, 10)}${extension}`;
    destination = blogImageFilePath(destinationName);
    if (fs.existsSync(destination)) throw new Error(`An image with the generated safe name already exists: ${destinationName}`);
  }

  const temporary = `${destination}.tmp-${process.pid}`;
  fs.writeFileSync(temporary, contents);
  fs.renameSync(temporary, destination);
  return {
    ...inspectBlogImage(contents, destinationName),
    src: `${BLOG_IMAGES_PUBLIC_PATH}${destinationName}`,
  };
}

export function readBlogPostFile(filePath) {
  const post = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const expectedId = path.basename(filePath, BLOG_POST_FILE_EXTENSION);
  if (post.id !== expectedId) throw new Error(`${path.basename(filePath)} must contain the matching post id: ${expectedId}`);
  return post;
}

export function loadBlogPosts() {
  return listBlogPostFiles().map(readBlogPostFile);
}

export function validateStoredBlogPost(post, options = {}) {
  return validateBlogPost(post, options);
}

export function writeBlogPostFile(post, options = {}) {
  ensureBlogStorageDirectories();
  assertValidBlogPost(post, { mode: options.mode || 'draft', validRouteIds: options.validRouteIds || [] });
  const availableImagePaths = new Set(
    fs.readdirSync(BLOG_IMAGES_ROOT, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => `${BLOG_IMAGES_PUBLIC_PATH}${entry.name}`),
  );
  const quality = validateBlogPostForEditorialUse(post, {
    mode: options.mode || 'draft',
    validRouteIds: options.validRouteIds || [],
    validRoutePaths: options.validRoutePaths || [],
    validRoutes: options.validRoutes || [],
    availableImagePaths,
  });
  if (quality.errors.length > 0) throw new Error(`Blog content validation failed:\n- ${quality.errors.join('\n- ')}`);
  const destination = blogPostFilePath(post.id);
  const temporary = `${destination}.tmp-${process.pid}`;
  fs.writeFileSync(temporary, `${JSON.stringify(post, null, 2)}\n`, 'utf8');
  fs.renameSync(temporary, destination);
  return destination;
}
